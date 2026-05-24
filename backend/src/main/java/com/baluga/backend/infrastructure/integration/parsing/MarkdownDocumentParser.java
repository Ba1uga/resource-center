package com.baluga.backend.infrastructure.integration.parsing;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class MarkdownDocumentParser implements DocumentParser {

    @Override
    public ParsedDocument parse(InputStream input, String fileName, String mimeType) {
        List<ChunkHint> hints = new ArrayList<>();

        String text = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))
                .lines()
                .collect(Collectors.joining("\n"));

        for (String line : text.split("\n")) {
            if (line.startsWith("#")) {
                String title = line.replaceAll("^#+\\s*", "").trim();
                hints.add(new ChunkHint(title, null, null));
            }
        }

        return new ParsedDocument(text, "markdown",
                countChineseChars(text), hints);
    }

    @Override
    public boolean supports(String mimeType, String fileName) {
        if (fileName == null) return false;
        String lower = fileName.toLowerCase();
        return lower.endsWith(".md") || lower.endsWith(".markdown")
                || "text/markdown".equalsIgnoreCase(mimeType);
    }

    private int countChineseChars(String text) {
        int c = 0;
        for (char ch : text.toCharArray()) {
            if (Character.UnicodeScript.of(ch) == Character.UnicodeScript.HAN) c++;
        }
        return c;
    }
}
