package com.baluga.backend.infrastructure.integration.parsing;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextShape;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;


public class PptDocumentParser implements DocumentParser {

    @Override
    public ParsedDocument parse(InputStream input, String fileName, String mimeType) {
        List<ChunkHint> hints = new ArrayList<>();
        StringBuilder fullText = new StringBuilder();

        try (XMLSlideShow ppt = new XMLSlideShow(input)) {
            List<XSLFSlide> slides = ppt.getSlides();
            for (int i = 0; i < slides.size(); i++) {
                XSLFSlide slide = slides.get(i);
                int slideNum = i + 1;
                String slideText = extractSlideText(slide);

                String title = extractSlideTitle(slide);
                if (title != null && !title.isEmpty()) {
                    fullText.append("## ").append(title).append("\n");
                    hints.add(new ChunkHint(title, null, slideNum));
                }

                if (!slideText.isEmpty()) {
                    fullText.append(slideText).append("\n\n");
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("PPT解析失败: " + fileName, e);
        }

        String text = fullText.toString().trim();
        return new ParsedDocument(text, "markdown", text.length(), hints);
    }

    private String extractSlideTitle(XSLFSlide slide) {
        for (XSLFShape shape : slide.getShapes()) {
            if (shape instanceof XSLFTextShape textShape) {
                String text = textShape.getText().trim();
                if (!text.isEmpty()) {
                    return text.split("\n")[0];
                }
            }
        }
        return "";
    }

    private String extractSlideText(XSLFSlide slide) {
        StringBuilder sb = new StringBuilder();
        for (XSLFShape shape : slide.getShapes()) {
            if (shape instanceof XSLFTextShape textShape) {
                for (XSLFTextParagraph para : textShape.getTextParagraphs()) {
                    String text = para.getText().trim();
                    if (!text.isEmpty()) {
                        sb.append(text).append("\n");
                    }
                }
            }
        }
        return sb.toString().trim();
    }

    @Override
    public boolean supports(String mimeType, String fileName) {
        if (fileName == null) return false;
        String lower = fileName.toLowerCase();
        return lower.endsWith(".pptx") || lower.endsWith(".ppt")
                || "application/vnd.openxmlformats-officedocument.presentationml.presentation".equalsIgnoreCase(mimeType)
                || "application/vnd.ms-powerpoint".equalsIgnoreCase(mimeType);
    }
}
