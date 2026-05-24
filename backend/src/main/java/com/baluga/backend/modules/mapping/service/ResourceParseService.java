package com.baluga.backend.modules.mapping.service;

import com.baluga.backend.modules.mapping.entity.ResourceContent;


public interface ResourceParseService {

    ResourceContent getOrParse(String resourceType, Long resourceId);
}
