package com.baluga.backend.modules.mount.engine;

import com.baluga.backend.modules.mount.dto.MountCandidate;
import com.baluga.backend.modules.mount.dto.ResourceContext;

import java.util.List;


public interface MountStrategy {

    String getName();

    /** Execution priority: lower number = runs first */
    int getPriority();

    /** Whether this strategy applies to the given resource */
    boolean supports(ResourceContext ctx);

    /** Execute matching, return candidates with per-strategy confidence */
    List<MountCandidate> execute(ResourceContext ctx, KnowledgeGraphScope scope);
}
