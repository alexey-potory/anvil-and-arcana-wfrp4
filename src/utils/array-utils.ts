export function areMatchingArrays<T>(arrayA: T[], arrayB: T[]){
    if (arrayA.length !== arrayB.length) {
        return false;
    }

    const sortedA = [...arrayA].sort();
    const sortedB = [...arrayB].sort();

    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) {
            return false;
        }
    }

    return true;
}