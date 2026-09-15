import { Branch } from "../infrastructure/entities/Branch";
import { IOrderItemSub } from "../infrastructure/entities/Order";

interface ICoordinates {
    lat: number;
    lon: number;
}

function calculateDistance(point1: ICoordinates, point2: ICoordinates): number {
    // distance between latitudes
    // and longitudes
    let dLat = (point2.lat - point1.lat) * Math.PI / 180.0;
    let dLon = (point2.lon - point1.lon) * Math.PI / 180.0;

    // convert to radiansa
    let lat1Rad = (point1.lat) * Math.PI / 180.0;
    let lat2Rad = (point2.lat) * Math.PI / 180.0;

    // apply formulae
    let a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) *
        Math.cos(lat1Rad) *
        Math.cos(lat2Rad);
    let rad = 6371;
    let c = 2 * Math.asin(Math.sqrt(a));
    return rad * c;
}

export async function allocateBestBranch(orderItems: IOrderItemSub[], customerLocation: ICoordinates) {
    const branches = await Branch.find({});

    let eligibleBranches = [];

    for (let branch of branches) {
        let hasAllStock = orderItems.every(orderItem => {
            const stockItem = branch.stock.find(s => s.productId.toString() === orderItem.productId.toString());
            return stockItem && stockItem.quantity >= orderItem.quantity;
        });

        if (!hasAllStock) continue;

        if (branch.currentWorkload >= branch.maxCapacity) continue;
        if (!branch.location) continue;

        const distance = calculateDistance(
            {
                lat: customerLocation.lat,
                lon: customerLocation.lon
            },
            {
                lat: branch.location.lat,
                lon: branch.location.lng
            }
        );
        eligibleBranches.push({
            branch,
            distance,
            workload: branch.currentWorkload
        });
    }

    if (eligibleBranches.length === 0) {
        throw new Error("No eligible branches found for the given order items and customer location.");
    }
    eligibleBranches.sort((a, b) => a.distance - b.distance);
    return eligibleBranches;
}