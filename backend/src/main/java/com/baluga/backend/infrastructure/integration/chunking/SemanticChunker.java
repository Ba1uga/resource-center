package com.baluga.backend.infrastructure.integration.chunking;

import com.baluga.backend.infrastructure.integration.parsing.DocumentParser.ChunkHint;

import java.util.ArrayList;
import java.util.List;


public class SemanticChunker implements ChunkStrategy {

    private static final String[] CONTENT_TYPE_MARKERS = {
            "定义", "概念", "指的是", "是指", "所谓",
            "例如", "比如", "举例", "示例",
            "练习", "习题", "题目", "解答", "解析",
            "总结", "小结", "概括", "综上",
            "注意", "重点", "关键", "难点"
    };

    private static final String[] CONTENT_TYPES = {
            "definition", "example", "exercise", "summary", "explanation"
    };

    @Override
    public List<Chunk> chunk(String fullText, List<ChunkHint> hints, ChunkConfig config) {
        List<Chunk> chunks = new ArrayList<>();
        if (fullText == null || fullText.isEmpty()) return chunks;

        String[] paragraphs = fullText.split("\n\n+");
        int maxChars = config.maxTokens() * 2;
        int chunkIdx = 0;

        StringBuilder buffer = new StringBuilder();
        String currentSection = "";
        Integer currentPage = null;
        Integer currentSlide = null;
        String currentContentType = "general";
        int bufferTokens = 0;

        for (String para : paragraphs) {
            para = para.trim();
            if (para.isEmpty()) continue;

            int paraTokens = estimateTokens(para);
            String paraContentType = detectContentType(para);

            // Check if we need to flush (buffer getting too large)
            if (bufferTokens + paraTokens > maxChars && buffer.length() > 0) {
                chunks.add(new Chunk(
                        buffer.toString().trim(),
                        bufferTokens,
                        currentContentType,
                        currentPage, currentSlide, currentSection
                ));
                chunkIdx++;
                buffer.setLength(0);
                bufferTokens = 0;
            }

            if (buffer.length() > 0) buffer.append("\n\n");
            buffer.append(para);
            bufferTokens += paraTokens;

            if (!"general".equals(paraContentType)) {
                currentContentType = paraContentType;
            }
        }

        // Flush remaining
        if (buffer.length() > 0) {
            chunks.add(new Chunk(
                    buffer.toString().trim(),
                    bufferTokens,
                    currentContentType,
                    currentPage, currentSlide, currentSection
            ));
        }

        return chunks;
    }

    private String detectContentType(String text) {
        for (int i = 0; i < CONTENT_TYPE_MARKERS.length; i++) {
            if (text.contains(CONTENT_TYPE_MARKERS[i])) {
                return CONTENT_TYPES[Math.min(i, CONTENT_TYPES.length - 1)];
            }
        }
        return "general";
    }

    private int estimateTokens(String text) {
        int chineseChars = 0;
        int others = 0;
        for (char c : text.toCharArray()) {
            if (Character.UnicodeScript.of(c) == Character.UnicodeScript.HAN) chineseChars++;
            else if (!Character.isWhitespace(c)) others++;
        }
        return chineseChars + (others + 1) / 2;
    }
}
