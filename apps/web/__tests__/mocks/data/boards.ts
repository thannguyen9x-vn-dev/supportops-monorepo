import type { Board } from "@supportops/types";

export const mockBoards: Board[] = [
  {
    id: "board-1",
    name: "Product Delivery",
    columns: [
      {
        id: "col-1",
        name: "Todo",
        sortOrder: 0,
        tasks: []
      }
    ]
  }
];
