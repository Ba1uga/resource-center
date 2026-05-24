package com.baluga.backend.infrastructure.integration.parsing;

import java.util.List;


public class DocumentParserFactory {

    private final List<DocumentParser> parsers;

    public DocumentParserFactory() {
        this.parsers = List.of(
                new PdfDocumentParser(),
                new WordDocumentParser(),
                new PptDocumentParser(),
                new MarkdownDocumentParser()
        );
    }

    public DocumentParser getParser(String mimeType, String fileName) {
        for (DocumentParser parser : parsers) {
            if (parser.supports(mimeType, fileName)) {
                return parser;
            }
        }
        return null;
    }
}
