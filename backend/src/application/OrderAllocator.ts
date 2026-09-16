import { Branch } from "../infrastructure/entities/Branch";
import { IOrderItemSub } from "../infrastructure/entities/Order";

interface ICoordinates {
    lat: number;
    lng: number;
}

function calculateDistance(point1: ICoordinates, point2: ICoordinates): number {
    // distance between latitudes
    // and longitudes
    let dLat = (point2.lat - point1.lat) * Math.PI / 180.0;
    let dLon = (point2.lng - point1.lng) * Math.PI / 180.0;

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

async function getDrivingDistance(point1: ICoordinates, point2: ICoordinates): Promise<number | null> {
    try {
        const osrmUrl = `${process.env.OSRMURL ?? ""}${point1.lng},${point1.lat};${point2.lng},${point2.lat}?overview=false`;
        const response = await fetch(osrmUrl);

        if (!response.ok) return null;

        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            return data.routes[0].distance / 1000;
        }
    } catch (error) {
        console.warn("OSRM API connection failed, falling back to Haversine formula.", error);
    }
    return null;
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

        const branchLocation = {
            lat: branch.location.lat,
            lng: branch.location.lng
        }

        let distance = await getDrivingDistance(customerLocation, branchLocation);

        if (distance === null) {
            const straightLineDistance = calculateDistance(customerLocation, branchLocation);
            distance = straightLineDistance * 1.3;
        }
        
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