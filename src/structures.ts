export interface DataStructure {
    name: string;
    description: string;
    complexity: Record<string, string>;
    render(container: HTMLElement, data: number[]): void;
    animateOperation?(operation: string, indices?: number[]): Promise<void>;
}

export class StaticArray implements DataStructure {
    name = 'Static Array';
    description = 'Fixed-size contiguous memory block with O(1) indexed access';
    complexity = {
        'Access': 'O(1)',
        'Insert': 'O(n)',
        'Delete': 'O(n)',
        'Search': 'O(n)'
    };
    
    private baseAddress = 0x1000;
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const memoryBlock = document.createElement('div');
        memoryBlock.className = 'memory-block';
        
        data.forEach((value, index) => {
            const cell = this.createMemoryCell(value, index);
            memoryBlock.appendChild(cell);
        });
        
        container.appendChild(memoryBlock);
    }
    
    private createMemoryCell(value: number, index: number): HTMLElement {
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

export class DynamicArray implements DataStructure {
    name = 'Dynamic Array';
    description = 'Resizable array with amortized O(1) append operations';
    complexity = {
        'Access': 'O(1)',
        'Append': 'O(1)*',
        'Insert': 'O(n)',
        'Delete': 'O(n)'
    };
    
    private baseAddress = 0x2000;
    private capacity = 16;
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const memoryBlock = document.createElement('div');
        memoryBlock.className = 'memory-block';
        
        for (let i = 0; i < this.capacity; i++) {
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

export class LinkedList implements DataStructure {
    name = 'Linked List';
    description = 'Sequential access structure with dynamic memory allocation';
    complexity = {
        'Access': 'O(n)',
        'Insert': 'O(1)',
        'Delete': 'O(1)',
        'Search': 'O(n)'
    };
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const listContainer = document.createElement('div');
        listContainer.style.display = 'flex';
        listContainer.style.alignItems = 'center';
        listContainer.style.flexWrap = 'wrap';
        listContainer.style.gap = '0';
        
        data.forEach((value, index) => {
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

export class DoublyLinkedList implements DataStructure {
    name = 'Doubly Linked List';
    description = 'Bidirectional traversal with previous and next pointers';
    complexity = {
        'Access': 'O(n)',
        'Insert': 'O(1)',
        'Delete': 'O(1)',
        'Reverse': 'O(n)'
    };
    
    render(container: HTMLElement, data: number[]) {
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
        
        data.forEach((value, index) => {
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

export class Stack implements DataStructure {
    name = 'Stack';
    description = 'LIFO (Last In First Out) structure';
    complexity = {
        'Push': 'O(1)',
        'Pop': 'O(1)',
        'Peek': 'O(1)',
        'Search': 'O(n)'
    };
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const stackContainer = document.createElement('div');
        stackContainer.className = 'stack-container';
        stackContainer.style.width = '100px';
        stackContainer.style.margin = '0 auto';
        
        data.forEach((value, index) => {
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

export class Queue implements DataStructure {
    name = 'Queue';
    description = 'FIFO (First In First Out) structure';
    complexity = {
        'Enqueue': 'O(1)',
        'Dequeue': 'O(1)',
        'Front': 'O(1)',
        'Search': 'O(n)'
    };
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const queueContainer = document.createElement('div');
        queueContainer.className = 'queue-container';
        queueContainer.style.justifyContent = 'center';
        
        data.forEach((value, index) => {
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

export class CircularBuffer implements DataStructure {
    name = 'Circular Buffer';
    description = 'Fixed-size buffer with wrap-around behavior';
    complexity = {
        'Read': 'O(1)',
        'Write': 'O(1)',
        'Space': 'O(n)',
        'Overflow': 'O(1)'
    };
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const bufferContainer = document.createElement('div');
        bufferContainer.style.position = 'relative';
        bufferContainer.style.width = '400px';
        bufferContainer.style.height = '400px';
        bufferContainer.style.margin = '0 auto';
        
        const radius = 150;
        const centerX = 200;
        const centerY = 200;
        
        data.forEach((value, index) => {
            const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
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

export class BinaryTree implements DataStructure {
    name = 'Binary Tree';
    description = 'Hierarchical structure with parent-child relationships';
    complexity = {
        'Access': 'O(log n)*',
        'Insert': 'O(log n)*',
        'Delete': 'O(log n)*',
        'Traverse': 'O(n)'
    };
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const treeContainer = document.createElement('div');
        treeContainer.style.position = 'relative';
        treeContainer.style.width = '100%';
        treeContainer.style.height = '400px';
        
        const levels = Math.ceil(Math.log2(data.length + 1));
        const containerWidth = 800;
        const levelHeight = 80;
        
        data.forEach((value, index) => {
            const level = Math.floor(Math.log2(index + 1));
            const positionInLevel = index - (Math.pow(2, level) - 1);
            const nodesInLevel = Math.pow(2, level);
            
            const x = (containerWidth / (nodesInLevel + 1)) * (positionInLevel + 1);
            const y = level * levelHeight + 50;
            
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
                
                const parentX = (containerWidth / (parentNodesInLevel + 1)) * (parentPosition + 1);
                const parentY = parentLevel * levelHeight + 50;
                
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

export class HashTable implements DataStructure {
    name = 'Hash Table';
    description = 'Key-value pairs with hash function mapping';
    complexity = {
        'Access': 'O(1)*',
        'Insert': 'O(1)*',
        'Delete': 'O(1)*',
        'Search': 'O(1)*'
    };
    
    private buckets = 8;
    
    render(container: HTMLElement, data: number[]) {
        container.innerHTML = '';
        const tableContainer = document.createElement('div');
        
        const bucketData: number[][] = Array(this.buckets).fill(null).map(() => []);
        
        data.forEach(value => {
            const hash = value % this.buckets;
            bucketData[hash].push(value);
        });
        
        bucketData.forEach((bucket, index) => {
            const bucketRow = document.createElement('div');
            bucketRow.className = 'hash-bucket';
            
            const bucketIndex = document.createElement('div');
            bucketIndex.className = 'bucket-index';
            bucketIndex.textContent = `[${index}]`;
            
            bucketRow.appendChild(bucketIndex);
            
            if (bucket.length > 0) {
                bucket.forEach(value => {
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

export function getDataStructure(type: string): DataStructure {
    switch (type) {
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