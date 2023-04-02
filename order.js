export class Order {

    constructor(id, customerId, orderDate, total, paymentMethod) {
        this.id = id;
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.total = total;
        this.paymentMethod = paymentMethod;
    } 
}