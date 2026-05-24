package com.baluga.backend.infrastructure.integration.parsing;

import java.util.List;


public interface DocumentParser {

    ParsedDocument parse(java.io.InputStream input, String fileName, String mimeType);

    boolean supports(String mimeType, String fileName);

    record ParsedDocument(
            String fullText,
            String textFormat,
            int wordCount,
            List<ChunkHint> chunkHints
    ) {}

    record ChunkHint(
            String sectionTitle,
            Integer pageNumber,
            Integer slideNumber
    ) {}
}
