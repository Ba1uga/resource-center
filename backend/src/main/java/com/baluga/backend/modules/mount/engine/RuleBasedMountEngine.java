package com.baluga.backend.modules.mount.engine;

import com.baluga.backend.modules.mount.dto.MountCandidate;
import com.baluga.backend.modules.mount.dto.ResourceContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Component
public class RuleBasedMountEngine implements MountStrategy {

    private static final Pattern CHAPTER_PATTERN =
            Pattern.compile("第([一二三四五六七八九十\\d]+)章");
    private static final Pattern SECTION_PATTERN =
            Pattern.compile("第([一二三四五六七八九十\\d]+)节");
    private static final Pattern COURSE_CODE_PATTERN =
            Pattern.compile("([A-Z]{2,4}\\d{3,4})");

    @Override
    public String getName() { return "rule"; }

    @Override
    public int getPriority() { return 1; }

    @Override
    public boolean supports(ResourceContext ctx) {
        return true; // always applicable
    }

    @Override
    public List<MountCandidate> execute(ResourceContext ctx, KnowledgeGraphScope scope) {
        List<MountCandidate> results = new ArrayList<>();

        // R1: course field direct match
        matchByCourseField(ctx, scope, results);

        // R2: chapter number in title
        matchByChapterPattern(ctx, scope, results);

        // R3: knowledge point name exact match in content
        matchByKeywordExact(ctx, scope, results);

        return results;
    }

    private void matchByCourseField(ResourceContext ctx, KnowledgeGraphScope scope,
                                     List<MountCandidate> results) {
        String course = ctx.getCourse();
        if (course == null || course.isEmpty()) return;

        var courseNodes = scope.nodesByType().getOrDefault("course", List.of());
        for (var node : courseNodes) {
            if (node.name().equals(course) || node.name().contains(course)
                    || course.contains(node.name())) {
                results.add(new MountCandidate(
                        node.id(), node.name(), "course", 1,
                        "rule", 0.95, "high"
                ));
            }
        }
    }

    private void matchByChapterPattern(ResourceContext ctx, KnowledgeGraphScope scope,
                                        List<MountCandidate> results) {
        String title = ctx.getTitle();
        if (title == null) return;

        Matcher cm = CHAPTER_PATTERN.matcher(title);
        if (!cm.find()) return;
        String chapterNum = cm.group(1);

        var chapterNodes = scope.nodesByType().getOrDefault("chapter", List.of());
        for (var node : chapterNodes) {
            if (node.name().contains(chapterNum) || node.name().contains("第" + chapterNum)) {
                results.add(new MountCandidate(
                        node.id(), node.name(), "chapter", 2,
                        "rule", 0.90, "high"
                ));
            }
        }
    }

    private void matchByKeywordExact(ResourceContext ctx, KnowledgeGraphScope scope,
                                      List<MountCandidate> results) {
        String text = ctx.getFullText();
        if (text == null || text.isEmpty()) text = ctx.getTitle();
        if (text == null || text.isEmpty()) return;

        var kpNodes = scope.nodesByType().getOrDefault("knowledge_point", List.of());
        for (var node : kpNodes) {
            if (node.name().length() >= 3 && text.contains(node.name())) {
                results.add(new MountCandidate(
                        node.id(), node.name(), "knowledge_point", node.nodeLevel(),
                        "rule", 0.85, "high"
                ));
            }
        }
    }
}
