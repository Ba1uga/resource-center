package com.baluga.backend.infrastructure.integration.matching;

import com.baluga.backend.infrastructure.integration.ai.AiMatchingProvider.ResourceInfo;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Collects resources from all resource tables into a unified list of ResourceInfo
 * for AI matching. Supports optional course and resource type filtering.
 */
@Component
public class ResourceCollector {

    private final com.baluga.backend.modules.textbook.mapper.TextbookMapper textbookMapper;
    private final com.baluga.backend.modules.courseware.mapper.CoursewareMapper coursewareMapper;
    private final com.baluga.backend.modules.question.mapper.QuestionMapper questionMapper;
    private final com.baluga.backend.modules.video.mapper.VideoMapper videoMapper;
    private final com.baluga.backend.modules.outline.mapper.OutlineVersionMapper outlineVersionMapper;
    private final com.baluga.backend.modules.outline.mapper.OutlineCourseMapper outlineCourseMapper;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public ResourceCollector(
            com.baluga.backend.modules.textbook.mapper.TextbookMapper textbookMapper,
            com.baluga.backend.modules.courseware.mapper.CoursewareMapper coursewareMapper,
            com.baluga.backend.modules.question.mapper.QuestionMapper questionMapper,
            com.baluga.backend.modules.video.mapper.VideoMapper videoMapper,
            com.baluga.backend.modules.outline.mapper.OutlineVersionMapper outlineVersionMapper,
            com.baluga.backend.modules.outline.mapper.OutlineCourseMapper outlineCourseMapper,
            com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.textbookMapper = textbookMapper;
        this.coursewareMapper = coursewareMapper;
        this.questionMapper = questionMapper;
        this.videoMapper = videoMapper;
        this.outlineVersionMapper = outlineVersionMapper;
        this.outlineCourseMapper = outlineCourseMapper;
        this.objectMapper = objectMapper;
    }

    /**
     * Collects all resources in the given course scope.
     *
     * @param courseFilter empty means all courses
     * @param resourceTypeFilter empty means all types
     * @return list of ResourceInfo with consecutive zero-based indexes
     */
    public List<ResourceInfo> collectResources(String courseFilter, String resourceTypeFilter) {
        List<ResourceInfo> result = new ArrayList<>();
        int index = 0;
        String course = normalize(courseFilter);
        String type = normalize(resourceTypeFilter);

        // textbooks -> article
        if (type.isEmpty() || type.equals("article")) {
            LambdaQueryWrapper<com.baluga.backend.modules.textbook.entity.Textbook> tw =
                    Wrappers.lambdaQuery();
            if (!course.isEmpty()) {
                tw.eq(com.baluga.backend.modules.textbook.entity.Textbook::getCourse, course);
            }
            for (var textbook : textbookMapper.selectList(tw)) {
                result.add(new ResourceInfo(
                        index++,
                        textbook.getName(),
                        "article",
                        textbook.getCourse(),
                        "",
                        ""
                ));
            }
        }

        // courseware
        if (type.isEmpty() || type.equals("courseware")) {
            LambdaQueryWrapper<com.baluga.backend.modules.courseware.entity.Courseware> cw =
                    Wrappers.lambdaQuery();
            if (!course.isEmpty()) {
                cw.eq(com.baluga.backend.modules.courseware.entity.Courseware::getCourse, course);
            }
            for (var courseware : coursewareMapper.selectList(cw)) {
                result.add(new ResourceInfo(
                        index++,
                        courseware.getTitle(),
                        "courseware",
                        courseware.getCourse(),
                        courseware.getChapter(),
                        ""
                ));
            }
        }

        // questions
        if (type.isEmpty() || type.equals("question")) {
            LambdaQueryWrapper<com.baluga.backend.modules.question.entity.Question> qw =
                    Wrappers.lambdaQuery();
            if (!course.isEmpty()) {
                qw.eq(com.baluga.backend.modules.question.entity.Question::getSubjectId, course);
            }
            for (var question : questionMapper.selectList(qw)) {
                String contentSnippet = question.getStem();
                if (contentSnippet != null && contentSnippet.length() > 500) {
                    contentSnippet = contentSnippet.substring(0, 500);
                }
                result.add(new ResourceInfo(
                        index++,
                        question.getStem() != null && question.getStem().length() > 200
                                ? question.getStem().substring(0, 200)
                                : (question.getStem() != null ? question.getStem() : ""),
                        "question",
                        question.getSubjectId(),
                        question.getChapterId(),
                        contentSnippet != null ? contentSnippet : ""
                ));
            }
        }

        // videos
        if (type.isEmpty() || type.equals("video")) {
            LambdaQueryWrapper<com.baluga.backend.modules.video.entity.Video> vw =
                    Wrappers.lambdaQuery();
            if (!course.isEmpty()) {
                vw.eq(com.baluga.backend.modules.video.entity.Video::getCourse, course);
            }
            for (var video : videoMapper.selectList(vw)) {
                result.add(new ResourceInfo(
                        index++,
                        video.getTitle(),
                        "video",
                        video.getCourse(),
                        video.getChapter(),
                        video.getDescription() != null ? video.getDescription() : ""
                ));
            }
        }

        // outline excerpt from schedule
        if (type.isEmpty() || type.equals("excerpt")) {
            var versions = outlineVersionMapper.selectList(Wrappers.lambdaQuery());
            for (var version : versions) {
                var outlineCourse = outlineCourseMapper.selectById(version.getCourseId());
                if (outlineCourse == null) continue;
                if (!course.isEmpty() && !course.equals(outlineCourse.getTitle())) continue;

                String sectionsJson = version.getSections();
                if (sectionsJson == null || sectionsJson.isBlank()) continue;

                try {
                    com.fasterxml.jackson.databind.JsonNode sections =
                            objectMapper.readTree(sectionsJson);
                    com.fasterxml.jackson.databind.JsonNode schedule = sections.get("schedule");
                    if (schedule != null && schedule.isArray()) {
                        for (com.fasterxml.jackson.databind.JsonNode item : schedule) {
                            String topic = item.has("topic") ? item.get("topic").asText() : "";
                            String chapterLabel = item.has("chapterLabel") ? item.get("chapterLabel").asText() : "";
                            if (topic.isBlank()) continue;
                            result.add(new ResourceInfo(
                                    index++,
                                    topic,
                                    "excerpt",
                                    outlineCourse.getTitle(),
                                    chapterLabel,
                                    ""
                            ));
                        }
                    }
                } catch (Exception ignored) {
                    // skip unparseable sections
                }
            }
        }

        return result;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
