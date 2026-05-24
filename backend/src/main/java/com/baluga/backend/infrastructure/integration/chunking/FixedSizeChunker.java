package com.baluga.backend.infrastructure.integration.chunking;

import com.baluga.backend.infrastructure.integration.parsing.DocumentParser.ChunkHint;

import java.util.ArrayList;
import java.util.List;


public class FixedSizeChunker implements ChunkStrategy {

    @Override
    public List<Chunk> chunk(String fullText, List<ChunkHint> hints, ChunkConfig config) {
        List<Chunk> chunks = new ArrayList<>();
        if (fullText == null || fullText.isEmpty()) return chunks;

        int maxChars = config.maxTokens() * 2; // rough: 1 token ≈ 2 chars for Chinese
        int overlapChars = config.overlapTokens() * 2;
        int textLen = fullText.length();
        int chunkIdx = 0;
        int pos = 0;

        while (pos < textLen) {
            int end = Math.min(pos + maxChars, textLen);
            String chunkText = fullText.substring(pos, end).trim();

            if (!chunkText.isEmpty()) {
                chunks.add(new Chunk(
                        chunkText,
                        estimateTokens(chunkText),
                        "general",
                        null, null, ""
                ));
                chunkIdx++;
            }

            if (end >= textLen) break;
            pos = end - overlapChars;
            if (pos <= 0) pos = end;
        }

        return chunks;
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
