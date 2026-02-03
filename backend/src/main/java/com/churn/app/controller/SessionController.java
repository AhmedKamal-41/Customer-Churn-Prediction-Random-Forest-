package com.churn.app.controller;

import com.churn.app.service.SessionStoreService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionStoreService sessionStore;

    public SessionController(SessionStoreService sessionStore) {
        this.sessionStore = sessionStore;
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String id) {
        Map<String, Object> session = sessionStore.get(id);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(session);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> putSession(@PathVariable String id, @RequestBody Map<String, Object> body) {
        sessionStore.put(id, body);
        return ResponseEntity.ok(body);
    }
}
