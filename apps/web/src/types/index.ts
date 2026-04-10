export interface Campaign {
    _id: string;
    _creationTime: number;
    hostId: string;
    title: string;
    description: string;
    category?: string;
    targetAmountLamports: number;
    raisedAmountLamports: number;
    deadline: number;
    state: string;
}
