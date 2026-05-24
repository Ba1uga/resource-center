package com.baluga.backend.modules.mount.engine;

import com.baluga.backend.modules.mount.dto.MountCandidate;
import com.baluga.backend.modules.mount.dto.ResourceContext;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;


@Component
public class EmbeddingMatchEngine implements MountStrategy {

    @Override
    public String getName() { return "embedding"; }

    @Override
    public int getPriority() { return 3; }

    @Override
    public boolean supports(ResourceContext ctx) {
        // Disabled until Sprint 4 (pgvector + Python embedding service) is deployed
        return false;
    }

    @Override
    public List<MountCandidate> execute(ResourceContext ctx, KnowledgeGraphScope scope) {
        return Collections.emptyList();
    }
}
