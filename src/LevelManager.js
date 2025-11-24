export default class LevelManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.levelIndex = 0;
        this.levels = [
            { spawnRate: 1000, theme: { bg: '#000022', star: '#ffffff' }, virusChance: 0 },
            { spawnRate: 800, theme: { bg: '#1a001a', star: '#ffccff' }, virusChance: 0 },
            { spawnRate: 600, theme: { bg: '#001a00', star: '#ccffcc' }, virusChance: 0.3 }, // Virus intro
            { spawnRate: 400, theme: { bg: '#1a0000', star: '#ffcccc' }, virusChance: 0.5 },
            { spawnRate: 300, theme: { bg: '#001a1a', star: '#ccffff' }, virusChance: 0.7 }
        ];
    }

    nextLevel() {
        if (this.levelIndex < this.levels.length - 1) {
            this.levelIndex++;
            // Visual feedback could go here
        } else {
            // Victory condition
            console.log("Victory!");
        }
    }

    getSpawnRate() {
        return this.levels[this.levelIndex].spawnRate;
    }
}
