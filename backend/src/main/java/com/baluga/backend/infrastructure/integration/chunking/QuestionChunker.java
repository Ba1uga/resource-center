package com.baluga.backend.infrastructure.integration.chunking;

import com.baluga.backend.infrastructure.integration.parsing.DocumentParser.ChunkHint;

import java.util.ArrayList;
import java.util.List;


public class QuestionChunker implements ChunkStrategy {

    @Override
    public List<Chunk> chunk(String fullText, List<ChunkHint> hints, ChunkConfig config) {
        List<Chunk> chunks = new ArrayList<>();
        if (fullText == null || fullText.isEmpty()) return chunks;

        // For question resources, the text is the question stem + options + analysis
        // Each question is one chunk
        chunks.add(new Chunk(
                fullText,
                estimateTokens(fullText),
                "exercise",
                null, null, ""
        ));

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
