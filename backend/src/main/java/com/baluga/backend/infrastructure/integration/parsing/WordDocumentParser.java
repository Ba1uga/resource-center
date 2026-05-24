package com.baluga.backend.infrastructure.integration.parsing;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;


public class WordDocumentParser implements DocumentParser {

    @Override
    public ParsedDocument parse(InputStream input, String fileName, String mimeType) {
        List<ChunkHint> hints = new ArrayList<>();
        StringBuilder fullText = new StringBuilder();

        try (XWPFDocument doc = new XWPFDocument(input)) {
            String currentHeading = "";
            for (XWPFParagraph para : doc.getParagraphs()) {
                String style = para.getStyleID();
                String text = para.getText().trim();

                if (text.isEmpty()) continue;

                if (style != null && style.startsWith("Heading")) {
                    currentHeading = text;
                    hints.add(new ChunkHint(currentHeading, null, null));
                }

                fullText.append(text).append("\n");
            }
        } catch (Exception e) {
            throw new RuntimeException("Word文档解析失败: " + fileName, e);
        }

        String text = fullText.toString().trim();
        return new ParsedDocument(text, "plain",
                countChineseWords(text) + countWords(text), hints);
    }

    @Override
    public boolean supports(String mimeType, String fileName) {
        if (fileName == null) return false;
        String lower = fileName.toLowerCase();
        return lower.endsWith(".docx") || lower.endsWith(".doc")
                || "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(mimeType)
                || "application/msword".equalsIgnoreCase(mimeType);
    }

    private int countChineseWords(String text) {
        int count = 0;
        for (char c : text.toCharArray()) {
            if (Character.UnicodeScript.of(c) == Character.UnicodeScript.HAN) count++;
        }
        return count;
    }

    private int countWords(String text) {
        return text.split("\\s+").length;
    }
}
