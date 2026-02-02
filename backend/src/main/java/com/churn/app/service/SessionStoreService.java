package com.churn.app.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for chat sessions keyed by session id.
 * Used by GET/PUT /api/sessions/{id} for optional server-side persistence.
 */
@Service
public class SessionStoreService {

    private final Map<String, Map<String, Object>> store = new ConcurrentHashMap<>();

    public Map<String, Object> get(String id) {
        return id == null ? null : store.get(id);
    }

    public void put(String id, Map<String, Object> session) {
        if (id != null && session != null) {
            store.put(id, session);
        }
    }
}
