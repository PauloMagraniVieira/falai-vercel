// ============================================================
// Mock Storage Layer — prepared for Cloudflare D1/R2 migration
// ============================================================

export interface GenerationRecord {
    id: string;
    personaId: string;
    personaName: string;
    garmentImageUrl: string;
    resultImageUrl: string;
    category: string;
    createdAt: string;
    cost: number; // estimated cost in USD
}

export interface PersonaRecord {
    id: string;
    name: string;
    imageUrl: string;
    seed?: number;
    description: string;
    style: string[];
}

// In-memory store (replaced by D1 in production)
const generations: GenerationRecord[] = [];

export function saveGeneration(record: GenerationRecord): void {
    generations.unshift(record);
    // Keep only last 50 in memory
    if (generations.length > 50) generations.pop();
}

export function getHistory(): GenerationRecord[] {
    return [...generations];
}

export function getGenerationById(id: string): GenerationRecord | undefined {
    return generations.find((g) => g.id === id);
}

// Generate unique IDs (replaced by UUID/CUID in production)
export function generateId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
