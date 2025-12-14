const container = document.querySelector(".data-container");
const info = document.getElementById("info");

let delay = 300;
let isPaused = false;
let isSorting = false;
let operations = 0;

/* ---------- UTILS ---------- */
async function sleep(ms) {
    while (isPaused) {
        await new Promise(r => setTimeout(r, 100));
    }
    return new Promise(r => setTimeout(r, ms));
}

function setSpeed(multiplier) {
    delay = 300 / multiplier;

    document.querySelectorAll(".speed-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    const activeBtn = document.getElementById(`speed-${multiplier}`);
    if (activeBtn) activeBtn.classList.add("active");
}


/* ---------- BARS ---------- */
function generateBars(num = 20) {
    if (isSorting) return;

    container.innerHTML = "";
    info.innerText = "";
    const maxHeight = 300;

    for (let i = 0; i < num; i++) {
        const value = Math.floor(Math.random() * 100) + 1;
        const bar = document.createElement("div");
        bar.classList.add("bar");

        bar.style.height = `${value * 3}px`;
        bar.style.width = `${container.clientWidth / num - 2}px`;
        bar.style.left = `${i * (container.clientWidth / num)}px`;

        bar.dataset.value = value;

        const label = document.createElement("span");
        label.innerText = value;
        bar.appendChild(label);

        container.appendChild(bar);

    }
}

generateBars();

/* ---------- CONTROLS ---------- */
function pauseSort() {
    isPaused = true;
}
function resumeSort() {
    isPaused = false;
}

function lockUI(lock) {
    isSorting = lock;
    document.querySelectorAll(".algo-btn").forEach(b => b.disabled = lock);
    document.getElementById("generate").disabled = lock;
}

function highlightAlgo(name) {
    document.querySelectorAll(".algo-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(name).classList.add("active");
}

/* ---------- START SORT ---------- */
function startSort(type) {
    if (isSorting) return;

    operations = 0;
    highlightAlgo(type);
    lockUI(true);

    const bars = document.querySelectorAll(".bar");

    if (type === "bubble") bubbleSort(bars);
    if (type === "selection") selectionSort(bars);
    if (type === "insertion") insertionSort(bars);
    if (type === "quick") {
    quickSort(bars, 0, bars.length - 1).then(() => {
        bars.forEach(bar => bar.style.background = "green");
    });
	}

    showComplexity(type);
}

/* ---------- SORTS ---------- */
async function bubbleSort(bars) {
    for (let i = 0; i < bars.length; i++) {
        for (let j = 0; j < bars.length - i - 1; j++) {
            operations++;

            bars[j].style.background = "red";
            bars[j + 1].style.background = "red";
            await sleep(delay);

            if (+bars[j].dataset.value > +bars[j + 1].dataset.value) {
                swap(bars[j], bars[j + 1]);
            }

            bars[j].style.background = "steelblue";
            bars[j + 1].style.background = "steelblue";
        }
        bars[bars.length - i - 1].style.background = "green";
    }
    endSort();
}


async function selectionSort(bars) {
    for (let i = 0; i < bars.length; i++) {
        let min = i;
        bars[min].style.background = "yellow";

        for (let j = i + 1; j < bars.length; j++) {
            operations++;

            bars[j].style.background = "red";
            await sleep(delay);

            if (+bars[j].dataset.value < +bars[min].dataset.value) {
                bars[min].style.background = "steelblue";
                min = j;
                bars[min].style.background = "yellow";
            } else {
                bars[j].style.background = "steelblue";
            }
        }

        swap(bars[i], bars[min]);
        bars[min].style.background = "steelblue";
        bars[i].style.background = "green";
    }
    endSort();
}


async function insertionSort(bars) {
    bars[0].style.background = "green";

    for (let i = 1; i < bars.length; i++) {
        let j = i;

        bars[j].style.background = "red";
        await sleep(delay);

        while (j > 0 && +bars[j - 1].dataset.value > +bars[j].dataset.value) {
            operations++;

            bars[j - 1].style.background = "red";
            swap(bars[j], bars[j - 1]);
            await sleep(delay);

            bars[j].style.background = "steelblue";
            j--;
        }

        for (let k = 0; k <= i; k++) {
            bars[k].style.background = "green";
        }
    }
    endSort();
}


async function quickSort(bars, l, r) {
    if (l >= r) return;
    let p = await partition(bars, l, r);
    await quickSort(bars, l, p - 1);
    await quickSort(bars, p + 1, r);
}


async function partition(bars, l, r) {
    let pivot = +bars[l].dataset.value;

    // Highlight pivot
    bars[l].style.background = "yellow";

    let count = 0;
    for (let i = l + 1; i <= r; i++) {
        operations++;
        bars[i].style.background = "red";
        await sleep(delay);

        if (+bars[i].dataset.value <= pivot) count++;
        bars[i].style.background = "steelblue";
    }

    let pivotIndex = l + count;
    swap(bars[l], bars[pivotIndex]);

 
    bars[pivotIndex].style.background = "steelblue";
    await sleep(delay);

    let i = l, j = r;
    while (i < pivotIndex && j > pivotIndex) {
        while (+bars[i].dataset.value <= pivot) i++;
        while (+bars[j].dataset.value > pivot) j--;

        if (i < pivotIndex && j > pivotIndex) {
            bars[i].style.background = "red";
            bars[j].style.background = "red";
            await sleep(delay);

            swap(bars[i], bars[j]);

            bars[i].style.background = "steelblue";
            bars[j].style.background = "steelblue";
            await sleep(delay);
        }
    }

    return pivotIndex;
}



/* ---------- HELPERS ---------- */
function swap(a, b) {
    let h = a.style.height;
    let v = a.dataset.value;
    let t = a.querySelector("span").innerText;

    a.style.height = b.style.height;
    a.dataset.value = b.dataset.value;
    a.querySelector("span").innerText = b.querySelector("span").innerText;

    b.style.height = h;
    b.dataset.value = v;
    b.querySelector("span").innerText = t;
}


function showComplexity(type) {
    const map = {
        bubble: "O(n²)",
        selection: "O(n²)",
        insertion: "O(n²)",
        quick: "O(n log n) avg"
    };
    info.innerText =
    `Algorithm: ${type.toUpperCase()} | Time: ${map[type]} | Operations: ${operations}`;

}

function endSort() {
    lockUI(false);

    info.innerText = info.innerText.replace(
        /Operations:\s*\d+/,
        `Operations: ${operations}`
    );

    isPaused = false;
}

setSpeed(1);

