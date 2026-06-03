package com.example.sms.service;

import com.example.sms.entity.ActivityLog;
import com.example.sms.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void log(String action, String username) {
        ActivityLog log = new ActivityLog();
        log.setAction(action);
        log.setUser(username);
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}
