export interface SortingState {
    array: number[];
    comparisons: number;
    swaps: number;
    memoryAccesses: number;
    comparing?: [number, number];
    swapping?: [number, number];
    sorted?: number[];
    pivot?: number;
}

export type SortingCallback = (state: SortingState) => Promise<void>;

export class SortingAlgorithms {
    private callback: SortingCallback;
    private delay: number;
    private paused: boolean = false;
    private stopped: boolean = false;
    private state: SortingState;

    constructor(array: number[], callback: SortingCallback, delay: number = 500) {
        this.state = {
            array: [...array],
            comparisons: 0,
            swaps: 0,
            memoryAccesses: 0,
            sorted: []
        };
        this.callback = callback;
        this.delay = delay;
    }

    setDelay(delay: number) {
        this.delay = delay;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    stop() {
        this.stopped = true;
    }

    private async waitForPause() {
        while (this.paused && !this.stopped) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (this.stopped) throw new Error('Sorting stopped');
    }

    private async updateState(updates: Partial<SortingState>) {
        Object.assign(this.state, updates);
        await this.callback(this.state);
        await new Promise(resolve => setTimeout(resolve, this.delay));
        await this.waitForPause();
    }

    private async compare(i: number, j: number): Promise<boolean> {
        this.state.comparisons++;
        this.state.memoryAccesses += 2;
        await this.updateState({ comparing: [i, j] });
        await this.updateState({ comparing: undefined });
        return this.state.array[i] > this.state.array[j];
    }

    private async swap(i: number, j: number) {
        this.state.swaps++;
        this.state.memoryAccesses += 4;
        await this.updateState({ swapping: [i, j] });
        
        const temp = this.state.array[i];
        this.state.array[i] = this.state.array[j];
        this.state.array[j] = temp;
        
        await this.updateState({ swapping: undefined });
    }

    private markSorted(index: number) {
        if (!this.state.sorted) this.state.sorted = [];
        this.state.sorted.push(index);
    }

    async bubbleSort(): Promise<number[]> {
        const n = this.state.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                if (await this.compare(j, j + 1)) {
                    await this.swap(j, j + 1);
                    swapped = true;
                }
            }
            
            this.markSorted(n - i - 1);
            await this.updateState({});
            
            if (!swapped) break;
        }
        
        this.markSorted(0);
        await this.updateState({});
        return this.state.array;
    }

    async selectionSort(): Promise<number[]> {
        const n = this.state.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            
            for (let j = i + 1; j < n; j++) {
                if (await this.compare(minIdx, j)) {
                    minIdx = j;
                }
            }
            
            if (minIdx !== i) {
                await this.swap(i, minIdx);
            }
            
            this.markSorted(i);
            await this.updateState({});
        }
        
        this.markSorted(n - 1);
        await this.updateState({});
        return this.state.array;
    }

    async insertionSort(): Promise<number[]> {
        const n = this.state.array.length;
        
        for (let i = 1; i < n; i++) {
            let j = i;
            
            while (j > 0 && await this.compare(j - 1, j)) {
                await this.swap(j - 1, j);
                j--;
            }
            
            this.markSorted(i);
            await this.updateState({});
        }
        
        return this.state.array;
    }

    async quickSort(low: number = 0, high: number = this.state.array.length - 1): Promise<number[]> {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
        
        if (low === 0 && high === this.state.array.length - 1) {
            for (let i = 0; i < this.state.array.length; i++) {
                this.markSorted(i);
            }
            await this.updateState({});
        }
        
        return this.state.array;
    }

    private async partition(low: number, high: number): Promise<number> {
        const pivot = this.state.array[high];
        await this.updateState({ pivot: high });
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            this.state.comparisons++;
            this.state.memoryAccesses += 2;
            await this.updateState({ comparing: [j, high] });
            
            if (this.state.array[j] < pivot) {
                i++;
                if (i !== j) {
                    await this.swap(i, j);
                }
            }
            
            await this.updateState({ comparing: undefined });
        }
        
        await this.swap(i + 1, high);
        await this.updateState({ pivot: undefined });
        
        return i + 1;
    }

    async mergeSort(left: number = 0, right: number = this.state.array.length - 1): Promise<number[]> {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
        
        if (left === 0 && right === this.state.array.length - 1) {
            for (let i = 0; i < this.state.array.length; i++) {
                this.markSorted(i);
            }
            await this.updateState({});
        }
        
        return this.state.array;
    }

    private async merge(left: number, mid: number, right: number) {
        const leftArr = this.state.array.slice(left, mid + 1);
        const rightArr = this.state.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            this.state.comparisons++;
            this.state.memoryAccesses += 3;
            
            await this.updateState({ comparing: [left + i, mid + 1 + j] });
            
            if (leftArr[i] <= rightArr[j]) {
                this.state.array[k] = leftArr[i];
                i++;
            } else {
                this.state.array[k] = rightArr[j];
                j++;
            }
            
            await this.updateState({ comparing: undefined });
            k++;
        }
        
        while (i < leftArr.length) {
            this.state.array[k] = leftArr[i];
            this.state.memoryAccesses++;
            i++;
            k++;
            await this.updateState({});
        }
        
        while (j < rightArr.length) {
            this.state.array[k] = rightArr[j];
            this.state.memoryAccesses++;
            j++;
            k++;
            await this.updateState({});
        }
    }

    async heapSort(): Promise<number[]> {
        const n = this.state.array.length;
        
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }
        
        for (let i = n - 1; i > 0; i--) {
            await this.swap(0, i);
            this.markSorted(i);
            await this.updateState({});
            await this.heapify(i, 0);
        }
        
        this.markSorted(0);
        await this.updateState({});
        return this.state.array;
    }

    private async heapify(n: number, i: number) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n) {
            this.state.comparisons++;
            this.state.memoryAccesses += 2;
            await this.updateState({ comparing: [left, largest] });
            
            if (this.state.array[left] > this.state.array[largest]) {
                largest = left;
            }
            
            await this.updateState({ comparing: undefined });
        }
        
        if (right < n) {
            this.state.comparisons++;
            this.state.memoryAccesses += 2;
            await this.updateState({ comparing: [right, largest] });
            
            if (this.state.array[right] > this.state.array[largest]) {
                largest = right;
            }
            
            await this.updateState({ comparing: undefined });
        }
        
        if (largest !== i) {
            await this.swap(i, largest);
            await this.heapify(n, largest);
        }
    }

    async radixSort(): Promise<number[]> {
        const max = Math.max(...this.state.array);
        const maxDigits = Math.floor(Math.log10(max)) + 1;
        
        for (let digit = 0; digit < maxDigits; digit++) {
            await this.countingSortByDigit(digit);
        }
        
        for (let i = 0; i < this.state.array.length; i++) {
            this.markSorted(i);
        }
        await this.updateState({});
        
        return this.state.array;
    }

    private async countingSortByDigit(digit: number) {
        const n = this.state.array.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        const divisor = Math.pow(10, digit);
        
        for (let i = 0; i < n; i++) {
            const digitValue = Math.floor(this.state.array[i] / divisor) % 10;
            count[digitValue]++;
            this.state.memoryAccesses++;
        }
        
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        for (let i = n - 1; i >= 0; i--) {
            const digitValue = Math.floor(this.state.array[i] / divisor) % 10;
            output[count[digitValue] - 1] = this.state.array[i];
            count[digitValue]--;
            this.state.memoryAccesses += 2;
            
            await this.updateState({ comparing: [i, count[digitValue]] });
            await this.updateState({ comparing: undefined });
        }
        
        for (let i = 0; i < n; i++) {
            this.state.array[i] = output[i];
            this.state.memoryAccesses++;
            await this.updateState({});
        }
    }

    async countingSort(): Promise<number[]> {
        const n = this.state.array.length;
        const max = Math.max(...this.state.array);
        const min = Math.min(...this.state.array);
        const range = max - min + 1;
        
        const count = new Array(range).fill(0);
        const output = new Array(n);
        
        for (let i = 0; i < n; i++) {
            count[this.state.array[i] - min]++;
            this.state.memoryAccesses++;
            await this.updateState({ comparing: [i, i] });
            await this.updateState({ comparing: undefined });
        }
        
        for (let i = 1; i < range; i++) {
            count[i] += count[i - 1];
        }
        
        for (let i = n - 1; i >= 0; i--) {
            output[count[this.state.array[i] - min] - 1] = this.state.array[i];
            count[this.state.array[i] - min]--;
            this.state.memoryAccesses += 2;
        }
        
        for (let i = 0; i < n; i++) {
            this.state.array[i] = output[i];
            this.markSorted(i);
            this.state.memoryAccesses++;
            await this.updateState({});
        }
        
        return this.state.array;
    }
}