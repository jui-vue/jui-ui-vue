// 원본(tree.js)의 util.index 파서(점(.)으로 구분된 "0.1.2" 형태의 노드 인덱스를 다루는
// 유틸)를 이 포트에서 실제로 쓰는 범위만 재구현했다.
export function parseIndex(index) {
    return String(index).split(".").map(Number)
}

export function getParentIndex(index) {
    const keys = parseIndex(index)
    if (keys.length <= 1) return null
    return keys.slice(0, -1).join(".")
}

export function getNextIndex(index) {
    const keys = parseIndex(index)
    keys[keys.length - 1] += 1
    return keys.join(".")
}
