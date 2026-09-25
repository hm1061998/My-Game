import { COLOR, colorNumber } from '../theme/tokens'

export const OFFICE_PALETTE = {
  ink: colorNumber(COLOR.ink),
  navy: 0x294858,
  teal: 0x3f7f83,
  mint: 0xd9eee2,
  cream: colorNumber(COLOR.paperLight),
  coral: colorNumber(COLOR.coral),
  amber: colorNumber(COLOR.amber),
  danger: colorNumber(COLOR.danger),
  safe: colorNumber(COLOR.safe),
  floor: 0xdcece4,
  floorLine: 0xb7d4ca,
} as const

export type CharacterStyle = {
  jacket: number
  accent: number
  hair: number
  skin: number
  badge: string
}

const CHARACTERS: Record<string, CharacterStyle> = {
  player: { jacket: 0xdd7655, accent: 0xffd17c, hair: 0x433536, skin: 0xf0bd91, badge: 'YOU' },
  maya: { jacket: 0x4a7da2, accent: 0x9fd2e5, hair: 0x302c3e, skin: 0xd99c72, badge: 'M' },
  leo: { jacket: 0x4e8c6b, accent: 0xb8df9b, hair: 0x593b2e, skin: 0xe6ad7e, badge: 'L' },
  nora: { jacket: 0x8b62a4, accent: 0xe4b4e8, hair: 0x3f3036, skin: 0xf0bd91, badge: 'N' },
}

export type EvidenceStyle = { color: number; symbol: string }

const EVIDENCE: Record<string, EvidenceStyle> = {
  'desk-email': { color: 0xe9a75e, symbol: '✉' },
  'chat-device': { color: 0x5c9fc5, symbol: '▣' },
  'archive-terminal': { color: 0x657c98, symbol: '⌁' },
  'meeting-minutes': { color: 0xd08d68, symbol: '≡' },
}

export function characterStyle(id: string): CharacterStyle {
  return CHARACTERS[id] ?? CHARACTERS.player
}

export function evidenceStyle(id: string): EvidenceStyle {
  return EVIDENCE[id] ?? { color: OFFICE_PALETTE.amber, symbol: 'i' }
}

const INTERACTION_LABELS: Record<string, string> = {
  'desk-email': 'HỒ SƠ · EMAIL',
  'chat-device': 'HỒ SƠ · CHAT',
  'archive-terminal': 'HỒ SƠ · LƯU TRỮ',
  'meeting-minutes': 'HỒ SƠ · BIÊN BẢN',
  'npc-maya': 'NPC · MAYA',
  'npc-leo': 'NPC · LEO',
  'npc-nora': 'NPC · NORA',
}

export function interactionLabel(id: string, fallback: string): string {
  return INTERACTION_LABELS[id] ?? fallback
}

export type MovementPose = { facing: -1 | 1; bob: number; stride: number; tilt: number; shadowScale: number }

export function movementPose(input: { x: number; y: number }, elapsedMs: number,
  dodging: boolean, previousFacing: -1 | 1): MovementPose {
  const moving = input.x !== 0 || input.y !== 0 || dodging
  const facing = input.x < 0 ? -1 : input.x > 0 ? 1 : previousFacing
  if (!moving) return { facing, bob: 0, stride: 0, tilt: 0, shadowScale: 1 }
  const phase = elapsedMs / (dodging ? 55 : 105)
  return {
    facing,
    bob: Math.abs(Math.sin(phase)) * -3,
    stride: Math.sin(phase) * (dodging ? 0.12 : 0.25),
    tilt: dodging ? facing * 0.12 : 0,
    shadowScale: dodging ? 1.28 : 0.92 + Math.abs(Math.sin(phase)) * 0.12,
  }
}

export type HudProgress = {
  status: string
  checkpointId: string
  encounterCleared: boolean
}

export function currentObjective(progress: HudProgress | null): string {
  if (!progress) return 'Bắt đầu lượt điều tra để vào hiện trường.'
  if (progress.status === 'Completed') return 'Vụ án đã hoàn tất · xem kết quả và ôn tập.'
  if (progress.checkpointId === 'office-entry') return 'Thu thập hồ sơ · tiến tới mốc an toàn khu họp.'
  if (!progress.encounterCleared) return 'Vượt máy quét · dùng Space để né và bảo vệ tiến độ.'
  return 'Đọc hồ sơ lưu trữ · hoàn thành câu hỏi và đưa ra kết luận.'
}
