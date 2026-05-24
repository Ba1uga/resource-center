package com.baluga.backend.modules.mapping.service;

import com.baluga.backend.modules.mapping.entity.ResourceChunk;
import com.baluga.backend.modules.mapping.entity.ResourceContent;

import java.util.List;


public interface ChunkService {

    List<ResourceChunk> chunkAndPersist(ResourceContent content);
}
