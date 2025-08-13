import { SortingAlgorithms, SortingState } from './algorithms.ts';
import { getDataStructure, DataStructure } from './structures.ts';

export class ArrayVisualizer {
    private data: number[] = [];
    private currentStructure: string = 'static-array';
    private structure: DataStructure;
    private sortingAlgorithm: SortingAlgorithms | null = null;
    private delay: number = 500;
    private isStepMode: boolean = false;
    private stepResolve: (() => void) | null = null;
    
    constructor() {
        this.structure = getDataStructure(this.currentStructure);
        this.initEventListeners();
        this.generateRandomData();
    }
    
    private initEventListeners() {
        document.querySelectorAll('.structure-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                this.switchStructure(target.dataset.structure!);
            });
        });
        
        document.getElementById('generateBtn')?.addEventListener('click', () => {
            this.generateRandomData();
        });
        
        document.getElementById('sortBtn')?.addEventListener('click', () => {
            this.startSort();
        });
        
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('stopBtn')?.addEventListener('click', () => {
            this.stopSort();
        });
        
        document.getElementById('stepBtn')?.addEventListener('click', () => {
            this.toggleStepMode();
        });
        
        const speedSlider = document.getElementById('speedSlider') as HTMLInputElement;
        speedSlider?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.delay = parseInt(target.value);
            document.getElementById('speedValue')!.textContent = `${target.value}ms`;
            if (this.sortingAlgorithm) {
                this.sortingAlgorithm.setDelay(this.delay);
            }
        });
        
        document.getElementById('toggleCode')?.addEventListener('click', () => {
            const panel = document.getElementById('codePanel');
            panel?.classList.toggle('collapsed');
            const btn = document.getElementById('toggleCode');
            if (btn) {
                btn.textContent = panel?.classList.contains('collapsed') ? 'Show' : 'Hide';
            }
        });
    }
    
    private switchStructure(structureType: string) {
        document.querySelectorAll('.structure-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-structure="${structureType}"]`)?.classList.add('active');
        
        this.currentStructure = structureType;
        this.structure = getDataStructure(structureType);
        this.updateStructureInfo();
        this.render();
    }
    
    private updateStructureInfo() {
        const infoDiv = document.getElementById('structure-info');
        if (!infoDiv) return;
        
        const title = infoDiv.querySelector('.structure-title');
        const desc = infoDiv.querySelector('.structure-desc');
        const complexityDiv = infoDiv.querySelector('.complexity-info');
        
        if (title) title.textContent = this.structure.name;
        if (desc) desc.textContent = this.structure.description;
        
        if (complexityDiv) {
            complexityDiv.innerHTML = '';
            Object.entries(this.structure.complexity).forEach(([op, complexity]) => {
                const item = document.createElement('div');
                item.className = 'complexity-item';
                item.innerHTML = `
                    <span class="op">${op}:</span>
                    <span class="complexity">${complexity}</span>
                `;
                complexityDiv.appendChild(item);
            });
        }
    }
    
    private generateRandomData() {
        const sizeInput = document.getElementById('sizeInput') as HTMLInputElement;
        const minInput = document.getElementById('minValue') as HTMLInputElement;
        const maxInput = document.getElementById('maxValue') as HTMLInputElement;
        
        const size = parseInt(sizeInput?.value || '15');
        const min = parseInt(minInput?.value || '1');
        const max = parseInt(maxInput?.value || '99');
        
        this.data = Array.from({ length: size }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
        );
        
        this.render();
        this.resetStats();
    }
    
    private render() {
        const container = document.getElementById('memoryContainer');
        if (!container) return;
        
        this.structure.render(container, this.data);
        this.updateStatus('Ready');
    }
    
    private async startSort() {
        const sortBtn = document.getElementById('sortBtn') as HTMLButtonElement;
        const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
        const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
        
        sortBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        
        const algorithm = (document.getElementById('sortAlgorithm') as HTMLSelectElement).value;
        
        this.displayAlgorithmCode(algorithm);
        
        const delay = this.isStepMode ? 0 : this.delay;
        this.sortingAlgorithm = new SortingAlgorithms(
            this.data,
            (state) => this.updateVisualization(state),
            delay
        );
        
        try {
            switch (algorithm) {
                case 'bubble':
                    await this.sortingAlgorithm.bubbleSort();
                    break;
                case 'selection':
                    await this.sortingAlgorithm.selectionSort();
                    break;
                case 'insertion':
                    await this.sortingAlgorithm.insertionSort();
                    break;
                case 'quick':
                    await this.sortingAlgorithm.quickSort();
                    break;
                case 'merge':
                    await this.sortingAlgorithm.mergeSort();
                    break;
                case 'heap':
                    await this.sortingAlgorithm.heapSort();
                    break;
                case 'radix':
                    await this.sortingAlgorithm.radixSort();
                    break;
                case 'counting':
                    await this.sortingAlgorithm.countingSort();
                    break;
            }
            
            this.updateStatus('Sort Complete');
            this.updatePhase('Finished');
        } catch (e) {
            this.updateStatus('Sort Stopped');
            this.updatePhase('Idle');
        }
        
        sortBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        pauseBtn.textContent = 'Pause';
    }
    
    private async updateVisualization(state: SortingState) {
        this.data = [...state.array];
        this.render();
        
        const elements = document.querySelectorAll('.array-element');
        
        elements.forEach(el => {
            el.classList.remove('comparing', 'swapping', 'sorted', 'pivot');
        });
        
        if (state.comparing) {
            state.comparing.forEach(index => {
                elements[index]?.classList.add('comparing');
            });
            this.updateStatus(`Comparing indices ${state.comparing[0]} and ${state.comparing[1]}`);
            this.updatePhase('Comparison');
        }
        
        if (state.swapping) {
            state.swapping.forEach(index => {
                elements[index]?.classList.add('swapping');
            });
            this.updateStatus(`Swapping indices ${state.swapping[0]} and ${state.swapping[1]}`);
            this.updatePhase('Swap');
        }
        
        if (state.sorted) {
            state.sorted.forEach(index => {
                elements[index]?.classList.add('sorted');
            });
        }
        
        if (state.pivot !== undefined) {
            elements[state.pivot]?.classList.add('pivot');
            this.updatePhase('Partitioning');
        }
        
        document.getElementById('comparisons')!.textContent = state.comparisons.toString();
        document.getElementById('swaps')!.textContent = state.swaps.toString();
        document.getElementById('memoryAccesses')!.textContent = state.memoryAccesses.toString();
        
        if (this.isStepMode) {
            await new Promise<void>(resolve => {
                this.stepResolve = resolve;
            });
        }
    }
    
    private togglePause() {
        const btn = document.getElementById('pauseBtn') as HTMLButtonElement;
        
        if (this.sortingAlgorithm) {
            if (btn.textContent === 'Pause') {
                this.sortingAlgorithm.pause();
                btn.textContent = 'Resume';
                this.updateStatus('Paused');
            } else {
                this.sortingAlgorithm.resume();
                btn.textContent = 'Pause';
                this.updateStatus('Sorting');
            }
        }
    }
    
    private stopSort() {
        if (this.sortingAlgorithm) {
            this.sortingAlgorithm.stop();
        }
    }
    
    private toggleStepMode() {
        const btn = document.getElementById('stepBtn') as HTMLButtonElement;
        this.isStepMode = !this.isStepMode;
        
        if (this.isStepMode) {
            btn.style.background = '#4caf50';
            btn.textContent = 'Next Step';
            btn.addEventListener('click', () => this.nextStep());
        } else {
            btn.style.background = '';
            btn.textContent = 'Step Mode';
            btn.removeEventListener('click', () => this.nextStep());
        }
    }
    
    private nextStep() {
        if (this.stepResolve) {
            this.stepResolve();
            this.stepResolve = null;
        }
    }
    
    private resetStats() {
        document.getElementById('comparisons')!.textContent = '0';
        document.getElementById('swaps')!.textContent = '0';
        document.getElementById('memoryAccesses')!.textContent = '0';
    }
    
    private updateStatus(status: string) {
        document.getElementById('currentOperation')!.textContent = status;
    }
    
    private updatePhase(phase: string) {
        document.getElementById('currentPhase')!.textContent = phase;
    }
    
    private displayAlgorithmCode(algorithm: string) {
        const codeDisplay = document.getElementById('codeDisplay');
        if (!codeDisplay) return;
        
        const algorithms: Record<string, string> = {
            bubble: `for i from 0 to n-1:
    for j from 0 to n-i-1:
        if array[j] > array[j+1]:
            swap(array[j], array[j+1])`,
            
            selection: `for i from 0 to n-1:
    minIndex = i
    for j from i+1 to n:
        if array[j] < array[minIndex]:
            minIndex = j
    swap(array[i], array[minIndex])`,
            
            insertion: `for i from 1 to n:
    key = array[i]
    j = i - 1
    while j >= 0 and array[j] > key:
        array[j+1] = array[j]
        j = j - 1
    array[j+1] = key`,
            
            quick: `function quickSort(low, high):
    if low < high:
        pi = partition(low, high)
        quickSort(low, pi-1)
        quickSort(pi+1, high)`,
        
            merge: `function mergeSort(left, right):
    if left < right:
        mid = (left + right) / 2
        mergeSort(left, mid)
        mergeSort(mid+1, right)
        merge(left, mid, right)`,
        
            heap: `function heapSort():
    buildMaxHeap()
    for i from n-1 to 1:
        swap(array[0], array[i])
        heapify(0, i)`,
        
            radix: `for digit in maxDigits:
    countingSort(array, digit)
    
function countingSort(array, digit):
    count digits at position
    reconstruct sorted array`,
    
            counting: `function countingSort():
    count = array of size (max-min+1)
    for each element:
        count[element-min]++
    reconstruct sorted array`
        };
        
        codeDisplay.textContent = algorithms[algorithm] || '';
    }
}