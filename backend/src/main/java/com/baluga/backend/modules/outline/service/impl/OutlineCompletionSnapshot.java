package com.baluga.backend.modules.outline.service.impl;


record OutlineCompletionSnapshot(
        int completionPercent,
        int completionIssueCount,
        String completionState
) {
}
