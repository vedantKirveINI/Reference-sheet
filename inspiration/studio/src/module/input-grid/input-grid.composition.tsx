import React, { useState } from "react";
import { InputGrid } from "./input-grid";
import { FX_VARIABLES } from "./constants/fxVariables";

// const initialData = [
//   {
//     id: 17008511706624,
//     key: "asd",
//     type: "string",
//     value: {
//       type: "fx",
//       blocks: [
//         {
//           type: "PRIMITIVES",
//           value: "ASD",
//         },
//       ],
//     },
//   },
//   {
//     id: 17238511706624,
//     key: "asd1",
//     type: "string",
//     value: {
//       type: "fx",
//       blocks: [
//         {
//           type: "PRIMITIVES",
//           value: "Shubham",
//         },
//       ],
//     },
//   },
//   {
//     id: 2308511706624,
//     key: "asd3",
//     type: "object",
//     config: [
//       {
//         id: 1708511706624,
//         key: "name",
//         type: "string",
//         value: {
//           type: "fx",
//           blocks: [
//             {
//               type: "PRIMITIVES",
//               value: "Shubham",
//             },
//           ],
//         },
//       },
//       {
//         id: 1708511706625,
//         key: "Age",
//         type: "number",
//         value: {
//           type: "fx",
//           blocks: [
//             {
//               type: "PRIMITIVES",
//               value: "23",
//             },
//           ],
//         },
//       },
//       //   {
//       //     id: 1708511706890,
//       //     key: "info",
//       //     type: "object",
//       //     config: [
//       //       {
//       //         id: 1708511706891,
//       //         key: "edu",
//       //         type: "array",
//       //         config: [
//       //           {
//       //             id: 1708511724931,
//       //             key: "BE",
//       //             type: "string",
//       //             value: {
//       //               type: "fx",
//       //               blocks: [
//       //                 {
//       //                   type: "PRIMITIVES",
//       //                   value: "123",
//       //                 },
//       //               ],
//       //             },
//       //           },
//       //           {
//       //             id: 1708511737921,
//       //             key: "HSC",
//       //             type: "string",
//       //             value: {
//       //               type: "fx",
//       //               blocks: [
//       //                 {
//       //                   type: "PRIMITIVES",
//       //                   value: "Eren",
//       //                 },
//       //               ],
//       //             },
//       //           },
//       //         ],
//       //       },
//       //       {
//       //         id: 1708511706894,
//       //         key: "address",
//       //         type: "object",
//       //         config: [
//       //           {
//       //             id: 1708511761441,
//       //             key: "building",
//       //             type: "string",
//       //             value: {
//       //               type: "fx",
//       //               blocks: [
//       //                 {
//       //                   type: "PRIMITIVES",
//       //                   value: "30",
//       //                 },
//       //               ],
//       //             },
//       //           },
//       //           {
//       //             id: 1708511778544,
//       //             key: "city",
//       //             type: "string",
//       //             value: {
//       //               type: "fx",
//       //               blocks: [
//       //                 {
//       //                   type: "PRIMITIVES",
//       //                   value: "30",
//       //                 },
//       //               ],
//       //             },
//       //           },
//       //         ],
//       //       },
//       //     ],
//       //   },
//     ],
//   },
//   {
//     id: 2708511724931,
//     key: "Random",
//     type: "string",
//     value: {
//       type: "fx",
//       blocks: [
//         {
//           type: "PRIMITIVES",
//           value: "Shubham",
//         },
//       ],
//     },
//   },
// ];

const initialData2 = [
  {
    id: "1718084854175",
    type: "string",
    key: "name",
    value: {
      type: "fx",
      blocks: [
        {
          type: "PRIMITIVES",
          value: "asd",
        },
      ],
    },
    valueStr: "asd",
  },
  {
    id: "1718084976023",
    type: "int",
    key: "age",
    value: {
      type: "fx",
      blocks: [
        {
          type: "PRIMITIVES",
          value: "23",
        },
      ],
    },
    valueStr: "23",
  },
  {
    id: "1718084980792",
    type: "object",
    key: "random",
    config: [
      {
        id: "1718084992522",
        type: "object",
        value: {
          type: "fx",
          blocks: [
            {
              type: "NODE",
              subType: "HTTP 2.orderId",
              displayValue: "HTTP 2.orderId",
              background: "#be63f9",
              foreground: "#fff",
              variableData: {
                type: "string",
                key: "orderId",
                sample_value: "123",
                path: ["orderId"],
                pathStr: "orderId",
                nodeName: "HTTP 2",
                nodeId: "1692361631574",
              },
            },
          ],
        },
        valueStr: "​HTTP 2.orderId​",
      },
    ],
    isMap: true,
  },
  {
    id: "1718084987049",
    type: "object",
    valueStr: "",
    key: "edu",
    config: [
      {
        id: "1718085010587",
        type: "string",
        key: "school",
        value: {
          type: "fx",
          blocks: [
            {
              type: "PRIMITIVES",
              value: "asd",
            },
          ],
        },
        valueStr: "asd",
      },
      {
        id: "1718085013082",
        type: "string",
        key: "college",
        value: {
          type: "fx",
          blocks: [
            {
              type: "PRIMITIVES",
              value: "Vit",
            },
          ],
        },
        valueStr: "Vit​",
      },
    ],
    isMap: false,
  },
];
const initialData3 = [
  {
    id: "17181734527824020",
    key: "result",
    type: "object",
    config: [
      {
        id: "17181734527829398",
        type: "array",
        config: [],
        key: "LOCAL",
      },
    ],
  },
  {
    id: "17181734527824020",
    key: "result",
    type: "object",
    config: [
      {
        id: "17181734527829398",
        type: "array",
        config: [],
        key: "test",
        // isMap: true
      },
    ],
  },
];

const initialData = [
  {
    id: "17181800127514342",
    type: "string",
    valueStr: "success",
    value: {
      type: "fx",
      blocks: [
        {
          type: "PRIMITIVES",
          value: "success",
        },
      ],
    },
    key: "status",
  },
  {
    id: "1718180012751374",
    type: "object",
    config: [
      {
        id: "1718180012752917",
        type: "array",
        config: [],
        key: "LOCAL",
      },
      {
        id: "17181800127526496",
        type: "array",
        config: [
          {
            id: "17181800127524616",
            type: "object",
            config: [
              {
                id: "17181800127522309",
                type: "string",
                valueStr: "HQZrjdK7N",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "HQZrjdK7N",
                    },
                  ],
                },
                key: "_id",
              },
              {
                id: "17181800127521473",
                type: "string",
                valueStr: "alston",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "alston",
                    },
                  ],
                },
                key: "name",
              },
              {
                id: "17181800127527528",
                type: "string",
                valueStr: "STRING",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "STRING",
                    },
                  ],
                },
                key: "data_type",
              },
              {
                id: "17181800127527977",
                type: "string",
                valueStr: "GLOBAL",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "GLOBAL",
                    },
                  ],
                },
                key: "mode",
              },
              {
                id: "17181800127528902",
                type: "string",
                valueStr: "zjOt2AMn4",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "zjOt2AMn4",
                    },
                  ],
                },
                key: "workspace_id",
              },
              {
                id: "17181800127521431",
                type: "string",
                valueStr: "Ts5qg5SdH",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "Ts5qg5SdH",
                    },
                  ],
                },
                key: "asset_id",
              },
              {
                id: "17181800127526331",
                type: "string",
                valueStr: "Ts5qg5SdH",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "Ts5qg5SdH",
                    },
                  ],
                },
                key: "parent_id",
              },
              {
                id: "17181800127525616",
                type: "array",
                config: [],
                key: "implemented_asset_ids",
              },
              {
                id: "17181800127526436",
                type: "string",
                valueStr: "pereira",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "pereira",
                    },
                  ],
                },
                key: "default",
              },
              {
                id: "17181800127523293",
                type: "string",
                valueStr: "ACTIVE",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "ACTIVE",
                    },
                  ],
                },
                key: "state",
              },
              {
                id: "1718180012752792",
                type: "string",
                valueStr: "2024-02-13T08:25:46.376Z",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "2024-02-13T08:25:46.376Z",
                    },
                  ],
                },
                key: "created_at",
              },
              {
                id: "17181800127521310",
                type: "string",
                valueStr: "2024-02-23T10:21:58.683Z",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "2024-02-23T10:21:58.683Z",
                    },
                  ],
                },
                key: "updated_at",
              },
              {
                id: "17181800127521548",
                type: "int",
                valueStr: "0",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "0",
                    },
                  ],
                },
                key: "__v",
              },
              {
                id: "17181800127526171",
                type: "object",
                config: [
                  {
                    id: "1718180012752854",
                    type: "string",
                    valueStr: "pereira",
                    value: {
                      type: "fx",
                      blocks: [
                        {
                          type: "PRIMITIVES",
                          value: "pereira",
                        },
                      ],
                    },
                    key: "dev",
                  },
                ],
                key: "env",
              },
              {
                id: "17181800127529248",
                type: "array",
                config: [],
                key: "implemented_assets",
              },
            ],
          },
          {
            id: "17181800127522767",
            type: "object",
            config: [
              {
                id: "17181800127529591",
                type: "string",
                valueStr: "IyKxx-XV7",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "IyKxx-XV7",
                    },
                  ],
                },
                key: "_id",
              },
              {
                id: "1718180012752571",
                type: "string",
                valueStr: "alston2",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "alston2",
                    },
                  ],
                },
                key: "name",
              },
              {
                id: "1718180012752895",
                type: "string",
                valueStr: "STRING",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "STRING",
                    },
                  ],
                },
                key: "data_type",
              },
              {
                id: "1718180012752424",
                type: "string",
                valueStr: "GLOBAL",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "GLOBAL",
                    },
                  ],
                },
                key: "mode",
              },
              {
                id: "17181800127525196",
                type: "string",
                valueStr: "zjOt2AMn4",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "zjOt2AMn4",
                    },
                  ],
                },
                key: "workspace_id",
              },
              {
                id: "17181800127528781",
                type: "string",
                valueStr: "Ts5qg5SdH",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "Ts5qg5SdH",
                    },
                  ],
                },
                key: "asset_id",
              },
              {
                id: "17181800127523268",
                type: "string",
                valueStr: "Ts5qg5SdH",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "Ts5qg5SdH",
                    },
                  ],
                },
                key: "parent_id",
              },
              {
                id: "1718180012752379",
                type: "array",
                config: [],
                key: "implemented_asset_ids",
              },
              {
                id: "17181800127528542",
                type: "string",
                valueStr: "pereira2",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "pereira2",
                    },
                  ],
                },
                key: "default",
              },
              {
                id: "17181800127523631",
                type: "string",
                valueStr: "ACTIVE",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "ACTIVE",
                    },
                  ],
                },
                key: "state",
              },
              {
                id: "17181800127528735",
                type: "string",
                valueStr: "2024-02-13T08:26:11.477Z",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "2024-02-13T08:26:11.477Z",
                    },
                  ],
                },
                key: "created_at",
              },
              {
                id: "17181800127525611",
                type: "string",
                valueStr: "2024-02-23T10:21:58.683Z",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "2024-02-23T10:21:58.683Z",
                    },
                  ],
                },
                key: "updated_at",
              },
              {
                id: "17181800127521266",
                type: "int",
                valueStr: "0",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "0",
                    },
                  ],
                },
                key: "__v",
              },
              {
                id: "17181800127526359",
                type: "object",
                config: [
                  {
                    id: "17181800127523964",
                    type: "string",
                    valueStr: "pereira2",
                    value: {
                      type: "fx",
                      blocks: [
                        {
                          type: "PRIMITIVES",
                          value: "pereira2",
                        },
                      ],
                    },
                    key: "dev",
                  },
                ],
                key: "env",
              },
              {
                id: "17181800127526696",
                type: "array",
                config: [],
                key: "implemented_assets",
              },
            ],
          },
        ],
        key: "GLOBAL",
      },
      {
        id: "17181800127526107",
        type: "array",
        config: [
          {
            id: "17181800127521167",
            type: "object",
            config: [
              {
                id: "1718180012752478",
                type: "string",
                valueStr: "7TYr-9cBi",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "7TYr-9cBi",
                    },
                  ],
                },
                key: "_id",
              },
              {
                id: "17181800127521182",
                type: "string",
                valueStr: "dev",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "dev",
                    },
                  ],
                },
                key: "name",
              },
              {
                id: "17181800127521766",
                type: "string",
                valueStr: "Ts5qg5SdH",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "Ts5qg5SdH",
                    },
                  ],
                },
                key: "asset_id",
              },
              {
                id: "17181800127521580",
                type: "string",
                valueStr: "zjOt2AMn4",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "zjOt2AMn4",
                    },
                  ],
                },
                key: "workspace_id",
              },
              {
                id: "17181800127525994",
                type: "string",
                valueStr: "ACTIVE",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "ACTIVE",
                    },
                  ],
                },
                key: "state",
              },
              {
                id: "17181800127526225",
                type: "string",
                valueStr: "2024-02-23T10:21:46.929Z",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "2024-02-23T10:21:46.929Z",
                    },
                  ],
                },
                key: "created_at",
              },
              {
                id: "17181800127521401",
                type: "string",
                valueStr: "2024-02-23T10:21:58.681Z",
                value: {
                  type: "fx",
                  blocks: [
                    {
                      type: "PRIMITIVES",
                      value: "2024-02-23T10:21:58.681Z",
                    },
                  ],
                },
                key: "updated_at",
              },
            ],
          },
        ],
        key: "env",
      },
    ],
    key: "result",
  },
];

export const BasicInputGrid = () => {
  const [initialValue, setInitialVal] = useState(initialData2);

  const onChange = (updatedValue) => {
    setInitialVal(() => updatedValue);
  };

  return (
    <div
      style={{
        margin: "20px",
      }}
    >
      <InputGrid
        variables={FX_VARIABLES}
        initialValue={initialValue}
        onChange={onChange}
      />
    </div>
  );
};
