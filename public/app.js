class SortingAlgorithms {
    callback;
    delay;
    paused = false;
    stopped = false;
    state;
    constructor(array, callback, delay = 500){
        this.state = {
            array: [
                ...array
            ],
            comparisons: 0,
            swaps: 0,
            memoryAccesses: 0,
            sorted: []
        };
        this.callback = callback;
        this.delay = delay;
    }
    setDelay(delay) {
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
    async waitForPause() {
        while(this.paused && !this.stopped){
            await new Promise((resolve)=>setTimeout(resolve, 100));
        }
        if (this.stopped) throw new Error('Sorting stopped');
    }
    async updateState(updates) {
        Object.assign(this.state, updates);
        await this.callback(this.state);
        await new Promise((resolve)=>setTimeout(resolve, this.delay));
        await this.waitForPause();
    }
    async compare(i, j) {
        this.state.comparisons++;
        this.state.memoryAccesses += 2;
        await this.updateState({
            comparing: [
                i,
                j
            ]
        });
        await this.updateState({
            comparing: undefined
        });
        return this.state.array[i] > this.state.array[j];
    }
    async swap(i, j) {
        this.state.swaps++;
        this.state.memoryAccesses += 4;
        await this.updateState({
            swapping: [
                i,
                j
            ]
        });
        const temp = this.state.array[i];
        this.state.array[i] = this.state.array[j];
        this.state.array[j] = temp;
        await this.updateState({
            swapping: undefined
        });
    }
    markSorted(index) {
        if (!this.state.sorted) this.state.sorted = [];
        this.state.sorted.push(index);
    }
    async bubbleSort() {
        const n = this.state.array.length;
        for(let i = 0; i < n - 1; i++){
            let swapped = false;
            for(let j = 0; j < n - i - 1; j++){
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
    async selectionSort() {
        const n = this.state.array.length;
        for(let i = 0; i < n - 1; i++){
            let minIdx = i;
            for(let j = i + 1; j < n; j++){
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
    async insertionSort() {
        const n = this.state.array.length;
        for(let i = 1; i < n; i++){
            let j = i;
            while(j > 0 && await this.compare(j - 1, j)){
                await this.swap(j - 1, j);
                j--;
            }
            this.markSorted(i);
            await this.updateState({});
        }
        return this.state.array;
    }
    async quickSort(low = 0, high = this.state.array.length - 1) {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
        if (low === 0 && high === this.state.array.length - 1) {
            for(let i = 0; i < this.state.array.length; i++){
                this.markSorted(i);
            }
            await this.updateState({});
        }
        return this.state.array;
    }
    async partition(low, high) {
        const pivot = this.state.array[high];
        await this.updateState({
            pivot: high
        });
        let i = low - 1;
        for(let j = low; j < high; j++){
            this.state.comparisons++;
            this.state.memoryAccesses += 2;
            await this.updateState({
                comparing: [
                    j,
                    high
                ]
            });
            if (this.state.array[j] < pivot) {
                i++;
                if (i !== j) {
                    await this.swap(i, j);
                }
            }
            await this.updateState({
                comparing: undefined
            });
        }
        await this.swap(i + 1, high);
        await this.updateState({
            pivot: undefined
        });
        return i + 1;
    }
    async mergeSort(left = 0, right = this.state.array.length - 1) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
        if (left === 0 && right === this.state.array.length - 1) {
            for(let i = 0; i < this.state.array.length; i++){
                this.markSorted(i);
            }
            await this.updateState({});
        }
        return this.state.array;
    }
    async merge(left, mid, right) {
        const leftArr = this.state.array.slice(left, mid + 1);
        const rightArr = this.state.array.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;
        while(i < leftArr.length && j < rightArr.length){
            this.state.comparisons++;
            this.state.memoryAccesses += 3;
            await this.updateState({
                comparing: [
                    left + i,
                    mid + 1 + j
                ]
            });
            if (leftArr[i] <= rightArr[j]) {
                this.state.array[k] = leftArr[i];
                i++;
            } else {
                this.state.array[k] = rightArr[j];
                j++;
            }
            await this.updateState({
                comparing: undefined
            });
            k++;
        }
        while(i < leftArr.length){
            this.state.array[k] = leftArr[i];
            this.state.memoryAccesses++;
            i++;
            k++;
            await this.updateState({});
        }
        while(j < rightArr.length){
            this.state.array[k] = rightArr[j];
            this.state.memoryAccesses++;
            j++;
            k++;
            await this.updateState({});
        }
    }
    async heapSort() {
        const n = this.state.array.length;
        for(let i = Math.floor(n / 2) - 1; i >= 0; i--){
            await this.heapify(n, i);
        }
        for(let i = n - 1; i > 0; i--){
            await this.swap(0, i);
            this.markSorted(i);
            await this.updateState({});
            await this.heapify(i, 0);
        }
        this.markSorted(0);
        await this.updateState({});
        return this.state.array;
    }
    async heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n) {
            this.state.comparisons++;
            this.state.memoryAccesses += 2;
            await this.updateState({
                comparing: [
                    left,
                    largest
                ]
            });
            if (this.state.array[left] > this.state.array[largest]) {
                largest = left;
            }
            await this.updateState({
                comparing: undefined
            });
        }
        if (right < n) {
            this.state.comparisons++;
            this.state.memoryAccesses += 2;
            await this.updateState({
                comparing: [
                    right,
                    largest
                ]
            });
            if (this.state.array[right] > this.state.array[largest]) {
                largest = right;
            }
            await this.updateState({
                comparing: undefined
            });
        }
        if (largest !== i) {
            await this.swap(i, largest);
            await this.heapify(n, largest);
        }
    }
    async radixSort() {
        const max = Math.max(...this.state.array);
        const maxDigits = Math.floor(Math.log10(max)) + 1;
        for(let digit = 0; digit < maxDigits; digit++){
            await this.countingSortByDigit(digit);
        }
        for(let i = 0; i < this.state.array.length; i++){
            this.markSorted(i);
        }
        await this.updateState({});
        return this.state.array;
    }
    async countingSortByDigit(digit) {
        const n = this.state.array.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        const divisor = Math.pow(10, digit);
        for(let i = 0; i < n; i++){
            const digitValue = Math.floor(this.state.array[i] / divisor) % 10;
            count[digitValue]++;
            this.state.memoryAccesses++;
        }
        for(let i = 1; i < 10; i++){
            count[i] += count[i - 1];
        }
        for(let i = n - 1; i >= 0; i--){
            const digitValue = Math.floor(this.state.array[i] / divisor) % 10;
            output[count[digitValue] - 1] = this.state.array[i];
            count[digitValue]--;
            this.state.memoryAccesses += 2;
            await this.updateState({
                comparing: [
                    i,
                    count[digitValue]
                ]
            });
            await this.updateState({
                comparing: undefined
            });
        }
        for(let i = 0; i < n; i++){
            this.state.array[i] = output[i];
            this.state.memoryAccesses++;
            await this.updateState({});
        }
    }
    async countingSort() {
        const n = this.state.array.length;
        const max = Math.max(...this.state.array);
        const min = Math.min(...this.state.array);
        const range = max - min + 1;
        const count = new Array(range).fill(0);
        const output = new Array(n);
        for(let i = 0; i < n; i++){
            count[this.state.array[i] - min]++;
            this.state.memoryAccesses++;
            await this.updateState({
                comparing: [
                    i,
                    i
                ]
            });
            await this.updateState({
                comparing: undefined
            });
        }
        for(let i = 1; i < range; i++){
            count[i] += count[i - 1];
        }
        for(let i = n - 1; i >= 0; i--){
            output[count[this.state.array[i] - min] - 1] = this.state.array[i];
            count[this.state.array[i] - min]--;
            this.state.memoryAccesses += 2;
        }
        for(let i = 0; i < n; i++){
            this.state.array[i] = output[i];
            this.markSorted(i);
            this.state.memoryAccesses++;
            await this.updateState({});
        }
        return this.state.array;
    }
}
class StaticArray {
    name = 'Static Array';
    description = 'Fixed-size contiguous memory block with O(1) indexed access';
    complexity = {
        'Access': 'O(1)',
        'Insert': 'O(n)',
        'Delete': 'O(n)',
        'Search': 'O(n)'
    };
    baseAddress = 0x1000;
    render(container, data) {
        container.innerHTML = '';
        const memoryBlock = document.createElement('div');
        memoryBlock.className = 'memory-block';
        data.forEach((value, index)=>{
            const cell = this.createMemoryCell(value, index);
            memoryBlock.appendChild(cell);
        });
        container.appendChild(memoryBlock);
    }
    createMemoryCell(value, index) {
        const cell = document.createElement('div');
        cell.className = 'memory-cell';
        const address = document.createElement('div');
        address.className = 'memory-address';
        address.textContent = `0x${(this.baseAddress + index * 4).toString(16).toUpperCase()}`;
        const element = document.createElement('div');
        element.className = 'array-element';
        element.dataset.index = index.toString();
        element.textContent = value.toString();
        cell.appendChild(address);
        cell.appendChild(element);
        return cell;
    }
}
class DynamicArray {
    name = 'Dynamic Array';
    description = 'Resizable array with amortized O(1) append operations';
    complexity = {
        'Access': 'O(1)',
        'Append': 'O(1)*',
        'Insert': 'O(n)',
        'Delete': 'O(n)'
    };
    baseAddress = 0x2000;
    capacity = 16;
    render(container, data) {
        container.innerHTML = '';
        const memoryBlock = document.createElement('div');
        memoryBlock.className = 'memory-block';
        for(let i = 0; i < this.capacity; i++){
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            const address = document.createElement('div');
            address.className = 'memory-address';
            address.textContent = `0x${(this.baseAddress + i * 4).toString(16).toUpperCase()}`;
            const element = document.createElement('div');
            element.className = 'array-element';
            element.dataset.index = i.toString();
            if (i < data.length) {
                element.textContent = data[i].toString();
            } else {
                element.style.opacity = '0.3';
                element.style.borderStyle = 'dashed';
            }
            cell.appendChild(address);
            cell.appendChild(element);
            memoryBlock.appendChild(cell);
        }
        const info = document.createElement('div');
        info.style.marginTop = '20px';
        info.style.color = '#4fc3f7';
        info.innerHTML = `Size: ${data.length} | Capacity: ${this.capacity}`;
        container.appendChild(memoryBlock);
        container.appendChild(info);
    }
}
class LinkedList {
    name = 'Linked List';
    description = 'Sequential access structure with dynamic memory allocation';
    complexity = {
        'Access': 'O(n)',
        'Insert': 'O(1)',
        'Delete': 'O(1)',
        'Search': 'O(n)'
    };
    render(container, data) {
        container.innerHTML = '';
        const listContainer = document.createElement('div');
        listContainer.style.display = 'flex';
        listContainer.style.alignItems = 'center';
        listContainer.style.flexWrap = 'wrap';
        listContainer.style.gap = '0';
        data.forEach((value, index)=>{
            const nodeGroup = document.createElement('div');
            nodeGroup.className = 'linked-node';
            const element = document.createElement('div');
            element.className = 'array-element';
            element.dataset.index = index.toString();
            element.textContent = value.toString();
            nodeGroup.appendChild(element);
            if (index < data.length - 1) {
                const link = document.createElement('div');
                link.className = 'node-link';
                nodeGroup.appendChild(link);
            }
            listContainer.appendChild(nodeGroup);
        });
        container.appendChild(listContainer);
    }
}
class DoublyLinkedList {
    name = 'Doubly Linked List';
    description = 'Bidirectional traversal with previous and next pointers';
    complexity = {
        'Access': 'O(n)',
        'Insert': 'O(1)',
        'Delete': 'O(1)',
        'Reverse': 'O(n)'
    };
    render(container, data) {
        container.innerHTML = '';
        const listContainer = document.createElement('div');
        listContainer.style.display = 'flex';
        listContainer.style.alignItems = 'flex-start';
        listContainer.style.gap = '5px';
        listContainer.style.flexWrap = 'wrap';
        listContainer.style.maxWidth = '100%';
        listContainer.style.padding = '20px';
        listContainer.style.justifyContent = 'flex-start';
        listContainer.style.alignContent = 'flex-start';
        data.forEach((value, index)=>{
            const nodeGroup = document.createElement('div');
            nodeGroup.style.display = 'flex';
            nodeGroup.style.alignItems = 'center';
            nodeGroup.style.marginBottom = '5px';
            nodeGroup.style.flexShrink = '0';
            if (index > 0) {
                const prevLink = document.createElement('div');
                prevLink.className = 'node-link';
                prevLink.style.transform = 'rotate(180deg)';
                prevLink.style.marginRight = '2px';
                prevLink.style.width = '30px';
                nodeGroup.appendChild(prevLink);
            }
            const element = document.createElement('div');
            element.className = 'array-element';
            element.dataset.index = index.toString();
            element.textContent = value.toString();
            element.style.margin = '2px';
            nodeGroup.appendChild(element);
            if (index < data.length - 1) {
                const nextLink = document.createElement('div');
                nextLink.className = 'node-link';
                nextLink.style.marginLeft = '2px';
                nextLink.style.width = '30px';
                nodeGroup.appendChild(nextLink);
            }
            listContainer.appendChild(nodeGroup);
        });
        container.appendChild(listContainer);
    }
}
class Stack {
    name = 'Stack';
    description = 'LIFO (Last In First Out) structure';
    complexity = {
        'Push': 'O(1)',
        'Pop': 'O(1)',
        'Peek': 'O(1)',
        'Search': 'O(n)'
    };
    render(container, data) {
        container.innerHTML = '';
        const stackContainer = document.createElement('div');
        stackContainer.className = 'stack-container';
        stackContainer.style.width = '100px';
        stackContainer.style.margin = '0 auto';
        data.forEach((value, index)=>{
            const element = document.createElement('div');
            element.className = 'array-element';
            element.dataset.index = index.toString();
            element.textContent = value.toString();
            if (index === data.length - 1) {
                element.style.borderColor = '#ff6b35';
                element.style.borderWidth = '3px';
            }
            stackContainer.appendChild(element);
        });
        const topLabel = document.createElement('div');
        topLabel.style.color = '#ff6b35';
        topLabel.style.marginTop = '10px';
        topLabel.style.textAlign = 'center';
        topLabel.textContent = 'TOP';
        container.appendChild(stackContainer);
        container.appendChild(topLabel);
    }
}
class Queue {
    name = 'Queue';
    description = 'FIFO (First In First Out) structure';
    complexity = {
        'Enqueue': 'O(1)',
        'Dequeue': 'O(1)',
        'Front': 'O(1)',
        'Search': 'O(n)'
    };
    render(container, data) {
        container.innerHTML = '';
        const queueContainer = document.createElement('div');
        queueContainer.className = 'queue-container';
        queueContainer.style.justifyContent = 'center';
        data.forEach((value, index)=>{
            const element = document.createElement('div');
            element.className = 'array-element';
            element.dataset.index = index.toString();
            element.textContent = value.toString();
            if (index === 0) {
                element.style.borderColor = '#4fc3f7';
                element.style.borderWidth = '3px';
            } else if (index === data.length - 1) {
                element.style.borderColor = '#ff6b35';
                element.style.borderWidth = '3px';
            }
            queueContainer.appendChild(element);
        });
        const labels = document.createElement('div');
        labels.style.display = 'flex';
        labels.style.justifyContent = 'space-between';
        labels.style.width = `${data.length * 80}px`;
        labels.style.margin = '10px auto';
        const frontLabel = document.createElement('span');
        frontLabel.style.color = '#4fc3f7';
        frontLabel.textContent = 'FRONT';
        const rearLabel = document.createElement('span');
        rearLabel.style.color = '#ff6b35';
        rearLabel.textContent = 'REAR';
        labels.appendChild(frontLabel);
        labels.appendChild(rearLabel);
        container.appendChild(queueContainer);
        container.appendChild(labels);
    }
}
class CircularBuffer {
    name = 'Circular Buffer';
    description = 'Fixed-size buffer with wrap-around behavior';
    complexity = {
        'Read': 'O(1)',
        'Write': 'O(1)',
        'Space': 'O(n)',
        'Overflow': 'O(1)'
    };
    render(container, data) {
        container.innerHTML = '';
        const bufferContainer = document.createElement('div');
        bufferContainer.style.position = 'relative';
        bufferContainer.style.width = '400px';
        bufferContainer.style.height = '400px';
        bufferContainer.style.margin = '0 auto';
        data.forEach((value, index)=>{
            const angle = index / data.length * 2 * Math.PI - Math.PI / 2;
            const x = 200 + 150 * Math.cos(angle);
            const y = 200 + 150 * Math.sin(angle);
            const element = document.createElement('div');
            element.className = 'array-element circular-element';
            element.dataset.index = index.toString();
            element.textContent = value.toString();
            element.style.left = `${x - 35}px`;
            element.style.top = `${y - 35}px`;
            if (index === 0) {
                element.style.borderColor = '#ff6b35';
                element.style.borderWidth = '3px';
            }
            bufferContainer.appendChild(element);
        });
        container.appendChild(bufferContainer);
    }
}
class BinaryTree {
    name = 'Binary Tree';
    description = 'Hierarchical structure with parent-child relationships';
    complexity = {
        'Access': 'O(log n)*',
        'Insert': 'O(log n)*',
        'Delete': 'O(log n)*',
        'Traverse': 'O(n)'
    };
    render(container, data) {
        container.innerHTML = '';
        const treeContainer = document.createElement('div');
        treeContainer.style.position = 'relative';
        treeContainer.style.width = '100%';
        treeContainer.style.height = '400px';
        Math.ceil(Math.log2(data.length + 1));
        data.forEach((value, index)=>{
            const level = Math.floor(Math.log2(index + 1));
            const positionInLevel = index - (Math.pow(2, level) - 1);
            const nodesInLevel = Math.pow(2, level);
            const x = 800 / (nodesInLevel + 1) * (positionInLevel + 1);
            const y = level * 80 + 50;
            const element = document.createElement('div');
            element.className = 'array-element tree-node';
            element.dataset.index = index.toString();
            element.textContent = value.toString();
            element.style.left = `${x - 35}px`;
            element.style.top = `${y - 35}px`;
            if (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                const parentLevel = Math.floor(Math.log2(parentIndex + 1));
                const parentPosition = parentIndex - (Math.pow(2, parentLevel) - 1);
                const parentNodesInLevel = Math.pow(2, parentLevel);
                const parentX = 800 / (parentNodesInLevel + 1) * (parentPosition + 1);
                const parentY = parentLevel * 80 + 50;
                const edge = document.createElement('div');
                edge.className = 'tree-edge';
                const length = Math.sqrt(Math.pow(x - parentX, 2) + Math.pow(y - parentY, 2));
                const angle = Math.atan2(y - parentY, x - parentX);
                edge.style.height = `${length}px`;
                edge.style.left = `${parentX}px`;
                edge.style.top = `${parentY}px`;
                edge.style.transform = `rotate(${angle + Math.PI / 2}rad)`;
                treeContainer.appendChild(edge);
            }
            treeContainer.appendChild(element);
        });
        container.appendChild(treeContainer);
    }
}
class HashTable {
    name = 'Hash Table';
    description = 'Key-value pairs with hash function mapping';
    complexity = {
        'Access': 'O(1)*',
        'Insert': 'O(1)*',
        'Delete': 'O(1)*',
        'Search': 'O(1)*'
    };
    buckets = 8;
    render(container, data) {
        container.innerHTML = '';
        const tableContainer = document.createElement('div');
        const bucketData = Array(this.buckets).fill(null).map(()=>[]);
        data.forEach((value)=>{
            const hash = value % this.buckets;
            bucketData[hash].push(value);
        });
        bucketData.forEach((bucket, index)=>{
            const bucketRow = document.createElement('div');
            bucketRow.className = 'hash-bucket';
            const bucketIndex = document.createElement('div');
            bucketIndex.className = 'bucket-index';
            bucketIndex.textContent = `[${index}]`;
            bucketRow.appendChild(bucketIndex);
            if (bucket.length > 0) {
                bucket.forEach((value)=>{
                    const element = document.createElement('div');
                    element.className = 'array-element';
                    element.textContent = value.toString();
                    element.style.marginLeft = '10px';
                    bucketRow.appendChild(element);
                });
            } else {
                const empty = document.createElement('div');
                empty.style.color = '#666';
                empty.style.marginLeft = '10px';
                empty.textContent = 'empty';
                bucketRow.appendChild(empty);
            }
            tableContainer.appendChild(bucketRow);
        });
        container.appendChild(tableContainer);
    }
}
function getDataStructure(type) {
    switch(type){
        case 'static-array':
            return new StaticArray();
        case 'dynamic-array':
            return new DynamicArray();
        case 'linked-list':
            return new LinkedList();
        case 'doubly-linked':
            return new DoublyLinkedList();
        case 'stack':
            return new Stack();
        case 'queue':
            return new Queue();
        case 'circular-buffer':
            return new CircularBuffer();
        case 'binary-tree':
            return new BinaryTree();
        case 'hash-table':
            return new HashTable();
        default:
            return new StaticArray();
    }
}
class ArrayVisualizer {
    data = [];
    currentStructure = 'static-array';
    structure;
    sortingAlgorithm = null;
    delay = 500;
    isStepMode = false;
    stepResolve = null;
    constructor(){
        this.structure = getDataStructure(this.currentStructure);
        this.initEventListeners();
        this.generateRandomData();
    }
    initEventListeners() {
        document.querySelectorAll('.structure-button').forEach((btn)=>{
            btn.addEventListener('click', (e)=>{
                const target = e.target;
                this.switchStructure(target.dataset.structure);
            });
        });
        document.getElementById('generateBtn')?.addEventListener('click', ()=>{
            this.generateRandomData();
        });
        document.getElementById('sortBtn')?.addEventListener('click', ()=>{
            this.startSort();
        });
        document.getElementById('pauseBtn')?.addEventListener('click', ()=>{
            this.togglePause();
        });
        document.getElementById('stopBtn')?.addEventListener('click', ()=>{
            this.stopSort();
        });
        document.getElementById('stepBtn')?.addEventListener('click', ()=>{
            this.toggleStepMode();
        });
        const speedSlider = document.getElementById('speedSlider');
        speedSlider?.addEventListener('input', (e)=>{
            const target = e.target;
            this.delay = parseInt(target.value);
            document.getElementById('speedValue').textContent = `${target.value}ms`;
            if (this.sortingAlgorithm) {
                this.sortingAlgorithm.setDelay(this.delay);
            }
        });
        document.getElementById('toggleCode')?.addEventListener('click', ()=>{
            const panel = document.getElementById('codePanel');
            panel?.classList.toggle('collapsed');
            const btn = document.getElementById('toggleCode');
            if (btn) {
                btn.textContent = panel?.classList.contains('collapsed') ? 'Show' : 'Hide';
            }
        });
    }
    switchStructure(structureType) {
        document.querySelectorAll('.structure-button').forEach((btn)=>{
            btn.classList.remove('active');
        });
        document.querySelector(`[data-structure="${structureType}"]`)?.classList.add('active');
        this.currentStructure = structureType;
        this.structure = getDataStructure(structureType);
        this.updateStructureInfo();
        this.render();
    }
    updateStructureInfo() {
        const infoDiv = document.getElementById('structure-info');
        if (!infoDiv) return;
        const title = infoDiv.querySelector('.structure-title');
        const desc = infoDiv.querySelector('.structure-desc');
        const complexityDiv = infoDiv.querySelector('.complexity-info');
        if (title) title.textContent = this.structure.name;
        if (desc) desc.textContent = this.structure.description;
        if (complexityDiv) {
            complexityDiv.innerHTML = '';
            Object.entries(this.structure.complexity).forEach(([op, complexity])=>{
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
    generateRandomData() {
        const sizeInput = document.getElementById('sizeInput');
        const minInput = document.getElementById('minValue');
        const maxInput = document.getElementById('maxValue');
        const size = parseInt(sizeInput?.value || '15');
        const min = parseInt(minInput?.value || '1');
        const max = parseInt(maxInput?.value || '99');
        this.data = Array.from({
            length: size
        }, ()=>Math.floor(Math.random() * (max - min + 1)) + min);
        this.render();
        this.resetStats();
    }
    render() {
        const container = document.getElementById('memoryContainer');
        if (!container) return;
        this.structure.render(container, this.data);
        this.updateStatus('Ready');
    }
    async startSort() {
        const sortBtn = document.getElementById('sortBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        sortBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        const algorithm = document.getElementById('sortAlgorithm').value;
        this.displayAlgorithmCode(algorithm);
        const delay = this.isStepMode ? 0 : this.delay;
        this.sortingAlgorithm = new SortingAlgorithms(this.data, (state)=>this.updateVisualization(state), delay);
        try {
            switch(algorithm){
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
    async updateVisualization(state) {
        this.data = [
            ...state.array
        ];
        this.render();
        const elements = document.querySelectorAll('.array-element');
        elements.forEach((el)=>{
            el.classList.remove('comparing', 'swapping', 'sorted', 'pivot');
        });
        if (state.comparing) {
            state.comparing.forEach((index)=>{
                elements[index]?.classList.add('comparing');
            });
            this.updateStatus(`Comparing indices ${state.comparing[0]} and ${state.comparing[1]}`);
            this.updatePhase('Comparison');
        }
        if (state.swapping) {
            state.swapping.forEach((index)=>{
                elements[index]?.classList.add('swapping');
            });
            this.updateStatus(`Swapping indices ${state.swapping[0]} and ${state.swapping[1]}`);
            this.updatePhase('Swap');
        }
        if (state.sorted) {
            state.sorted.forEach((index)=>{
                elements[index]?.classList.add('sorted');
            });
        }
        if (state.pivot !== undefined) {
            elements[state.pivot]?.classList.add('pivot');
            this.updatePhase('Partitioning');
        }
        document.getElementById('comparisons').textContent = state.comparisons.toString();
        document.getElementById('swaps').textContent = state.swaps.toString();
        document.getElementById('memoryAccesses').textContent = state.memoryAccesses.toString();
        if (this.isStepMode) {
            await new Promise((resolve)=>{
                this.stepResolve = resolve;
            });
        }
    }
    togglePause() {
        const btn = document.getElementById('pauseBtn');
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
    stopSort() {
        if (this.sortingAlgorithm) {
            this.sortingAlgorithm.stop();
        }
    }
    toggleStepMode() {
        const btn = document.getElementById('stepBtn');
        this.isStepMode = !this.isStepMode;
        if (this.isStepMode) {
            btn.style.background = '#4caf50';
            btn.textContent = 'Next Step';
            btn.addEventListener('click', ()=>this.nextStep());
        } else {
            btn.style.background = '';
            btn.textContent = 'Step Mode';
            btn.removeEventListener('click', ()=>this.nextStep());
        }
    }
    nextStep() {
        if (this.stepResolve) {
            this.stepResolve();
            this.stepResolve = null;
        }
    }
    resetStats() {
        document.getElementById('comparisons').textContent = '0';
        document.getElementById('swaps').textContent = '0';
        document.getElementById('memoryAccesses').textContent = '0';
    }
    updateStatus(status) {
        document.getElementById('currentOperation').textContent = status;
    }
    updatePhase(phase) {
        document.getElementById('currentPhase').textContent = phase;
    }
    displayAlgorithmCode(algorithm) {
        const codeDisplay = document.getElementById('codeDisplay');
        if (!codeDisplay) return;
        const algorithms = {
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
document.addEventListener('DOMContentLoaded', ()=>{
    new ArrayVisualizer();
    console.log('Array & Data Structure Visualizer initialized');
    console.log('Memory visualization active at base address 0x1000');
});
