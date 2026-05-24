package com.baluga.backend.modules.mount.service;

import com.baluga.backend.modules.mount.dto.response.MountPreviewVO;
import com.baluga.backend.modules.mount.dto.request.MountPreviewRequest;


public interface MountService {

    MountPreviewVO preview(MountPreviewRequest request);
}
