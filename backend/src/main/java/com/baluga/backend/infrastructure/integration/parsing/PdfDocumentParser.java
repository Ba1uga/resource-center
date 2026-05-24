package com.baluga.backend.infrastructure.integration.parsing;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;


public class PdfDocumentParser implements DocumentParser {

    @Override
    public ParsedDocument parse(InputStream input, String fileName, String mimeType) {
        List<ChunkHint> hints = new ArrayList<>();
        StringBuilder fullText = new StringBuilder();

        try (PDDocument pdf = Loader.loadPDF(input.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();

            int total = pdf.getNumberOfPages();
            for (int page = 1; page <= total; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = stripper.getText(pdf).trim();
                if (!pageText.isEmpty()) {
                    fullText.append(pageText).append("\n\n");
                    hints.add(new ChunkHint("", page, null));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("PDF解析失败: " + fileName, e);
        }

        String text = fullText.toString().trim();
        return new ParsedDocument(text, "plain", text.length(), hints);
    }

    @Override
    public boolean supports(String mimeType, String fileName) {
        if (fileName == null) return false;
        String lower = fileName.toLowerCase();
        return lower.endsWith(".pdf")
                || "application/pdf".equalsIgnoreCase(mimeType);
    }
}
