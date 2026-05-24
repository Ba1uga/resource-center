package com.baluga.backend.modules.mapping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baluga.backend.infrastructure.integration.chunking.ChunkStrategy;
import com.baluga.backend.infrastructure.integration.chunking.ChunkStrategy.Chunk;
import com.baluga.backend.infrastructure.integration.chunking.ChunkStrategy.ChunkConfig;
import com.baluga.backend.infrastructure.integration.chunking.ChunkerFactory;
import com.baluga.backend.modules.mapping.entity.ResourceChunk;
import com.baluga.backend.modules.mapping.entity.ResourceContent;
import com.baluga.backend.modules.mapping.mapper.ResourceChunkMapper;
import com.baluga.backend.modules.mapping.service.ChunkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class ChunkServiceImpl implements ChunkService {

    private static final Logger log = LoggerFactory.getLogger(ChunkServiceImpl.class);

    private final ResourceChunkMapper resourceChunkMapper;
    private final ChunkerFactory chunkerFactory;

    public ChunkServiceImpl(ResourceChunkMapper resourceChunkMapper) {
        this.resourceChunkMapper = resourceChunkMapper;
        this.chunkerFactory = new ChunkerFactory();
    }

    @Override
    public List<ResourceChunk> chunkAndPersist(ResourceContent content) {
        // Delete old chunks for this content (idempotent re-chunk)
        LambdaQueryWrapper<ResourceChunk> delWrapper = Wrappers.lambdaQuery();
        delWrapper.eq(ResourceChunk::getContentId, content.getId());
        resourceChunkMapper.delete(delWrapper);

        if (content.getFullText() == null || content.getFullText().isEmpty()) {
            return List.of();
        }

        ChunkStrategy strategy = chunkerFactory.getStrategy(content.getResourceType());
        ChunkConfig config = ChunkConfig.forResource(content.getResourceType());

        List<Chunk> chunks = strategy.chunk(
                content.getFullText(),
                List.of(), // hints from parser can be passed here later
                config
        );

        List<ResourceChunk> entities = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            Chunk c = chunks.get(i);
            ResourceChunk entity = ResourceChunk.builder()
                    .resourceType(content.getResourceType())
                    .resourceId(content.getResourceId())
                    .contentId(content.getId())
                    .chunkIndex(i)
                    .chunkText(c.text())
                    .tokenCount(c.tokenCount())
                    .contentType(c.contentType())
                    .pageNumber(c.pageNumber())
                    .slideNumber(c.slideNumber())
                    .sectionTitle(c.sectionTitle())
                    .deleted(0)
                    .build();
            entities.add(entity);
        }

        if (!entities.isEmpty()) {
            for (ResourceChunk entity : entities) {
                resourceChunkMapper.insert(entity);
            }
            log.info("分块完成: resourceType={}, resourceId={}, chunks={}",
                    content.getResourceType(), content.getResourceId(), entities.size());
        }

        return entities;
    }
}
