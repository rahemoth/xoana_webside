package com.xoana.dto;

import com.xoana.model.Order;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private List<OrderItemRequest> items;
    private String shippingAddress;
    private String contactName;
    private String contactPhone;
    private Order.PaymentMethod paymentMethod;
    private String remark;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
