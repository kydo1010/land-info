import { useRef, useState } from "react";
import { searchAddress } from "../api/search.js";

const AUTOCOMPLETE_MIN_LEN = 2;
const AUTOCOMPLETE_DEBOUNCE_MS = 300;

// 주소 검색창의 입력값·검색 상태·후보 목록과 자동완성(디바운스) 동작을 전부 이 훅이 관리한다.
// 어떤 탭이 열려있는지는 몰라도 되므로 useTabs와는 독립적이다 — App.jsx가 탭 전환 등 필요한
// 시점에 setQuery/setSearch를 직접 불러 동기화한다.
export function useAddressSearch() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("idle");
  const [candidates, setCandidates] = useState([]);
  const autocompleteTimer = useRef(null);
  const searchSeq = useRef(0);

  // qOverride: EmptyState의 예시 버튼처럼 setQuery 직후 바로 검색해야 할 때, setQuery의 상태
  // 반영을 기다리지 않고 그 값으로 바로 검색하기 위해 받는다(state 클로저 지연 문제 회피).
  const runSearch = (qOverride) => {
    clearTimeout(autocompleteTimer.current);
    const q = (qOverride ?? query).trim();
    const seq = ++searchSeq.current;
    if (!q) {
      setSearch("none");
      setCandidates([]);
      return;
    }
    setSearch("loading");
    searchAddress(q)
      .then((results) => {
        if (seq !== searchSeq.current) return; // 타이핑 중 더 최신 요청이 나갔으면 늦게 온 응답은 버린다.
        setCandidates(results);
        setSearch(results.length ? "results" : "none");
      })
      .catch(() => {
        if (seq !== searchSeq.current) return;
        setSearch("error");
      });
  };

  // 자동완성: 입력이 멈춘 뒤 300ms 후, 2자 이상이면 자동으로 검색한다.
  const handleQueryChange = (value) => {
    setQuery(value);
    clearTimeout(autocompleteTimer.current);
    if (value.trim().length < AUTOCOMPLETE_MIN_LEN) {
      searchSeq.current++; // 진행 중이던 검색 응답도 무효화해 늦게 덮어쓰지 않게 한다.
      setSearch("idle");
      setCandidates([]);
      return;
    }
    autocompleteTimer.current = setTimeout(() => runSearch(value), AUTOCOMPLETE_DEBOUNCE_MS);
  };

  return { query, setQuery, search, setSearch, candidates, runSearch, handleQueryChange };
}
