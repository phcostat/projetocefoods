package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.MensagemDTO;
import com.projetocefoods.cefoods.model.Mensagem;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.service.MensagemService;
import com.projetocefoods.cefoods.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mensagens")
@RequiredArgsConstructor
public class MensagemController {

    private final MensagemService mensagemService;
    private final UsuarioRepository usuarioRepository;

    // GET history by sala
    @GetMapping("/sala/{sala}")
    public ResponseEntity<List<MensagemDTO>> historyBySala(@PathVariable String sala) {
        try {
            List<MensagemDTO> list = mensagemService.listarPorSala(sala);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // GET conversations summary for a user
    @GetMapping("/conversas/{userId}")
    public ResponseEntity<List<Map<String, Object>>> conversas(@PathVariable Long userId) {
        try {
            // build conversation map from latest messages per sala where user participates
            List<MensagemDTO> all = new ArrayList<>();
            // naive approach: fetch all messages where user is sender or receiver, then group by sala
            // If you have many messages, replace with a optimized JPQL/native query
            // Get all messages involving user by querying repository via service helper if you implement it

            // We'll search by scanning all possible rooms by calling listarPorUsuarios for known users is heavy.
            // Simpler and performant for typical datasets: query mensagens table in repository for messages where sender or receiver = userId and group by sala

            // For portability, use service to fetch all messages involving user by scanning users (costly) — but for now iterate over user's relations

            // We'll ask MensagemService to provide a method fetchLatestPerSala(userId) if you want an efficient version.

            // Temporary: list all messages where user is sender OR receiver (MensagemService doesn't provide a direct method), we will rely on repository in service.
            // Fallback: return empty list if not implemented.

            // For now, attempt to produce conversation list using listarPorUsuarios by scanning other users (this is O(n^2) so use only for testing)
            List<Map<String, Object>> result = new ArrayList<>();

            // Try to fetch all users (if repository exists)
            List<Long> otherIds = usuarioRepository.findAll().stream().map(Usuario::getIdUsuario).filter(id -> !id.equals(userId)).collect(Collectors.toList());

            for (Long other : otherIds) {
                try {
                    List<MensagemDTO> msgs = mensagemService.listarPorUsuarios(userId, other);
                    if (msgs != null && !msgs.isEmpty()) {
                        MensagemDTO last = msgs.get(msgs.size() - 1);
                        Map<String, Object> m = new HashMap<>();
                        m.put("room", last.getSala());
                        m.put("otherId", other);
                        m.put("lastMessage", last.getMensagem());
                        m.put("lastAt", last.getEnviadoEm());
                        m.put("unread", 0);
                        result.add(m);
                    }
                } catch (Exception ex) {
                    // ignore
                }
            }

            // sort by lastAt desc
            result.sort((a, b) -> {
                Comparable ta = (Comparable)a.get("lastAt");
                Comparable tb = (Comparable)b.get("lastAt");
                if (ta == null && tb == null) return 0;
                if (ta == null) return 1;
                if (tb == null) return -1;
                return tb.compareTo(ta);
            });

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
