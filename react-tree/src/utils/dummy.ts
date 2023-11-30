export const TREE_DATA = [
    {
      id: 1,
      type: 'group' as const,
      depth: 1,
      items: [
          {
            id: 2,
            type: 'group' as const,
            depth: 2,
            items: []
          },
          {
            id: 3,
            type: 'single' as const,
            depth: 2,
            items: []
          },
          {
            id: 4,
            type: 'group' as const,
            depth: 2,
            items: [
              {
                id: 9,
                type: 'group' as const,
                depth: 3,
                items: []
              },
              {
                id: 10,
                type: 'single' as const,
                depth: 3,
                items: []
              },
              {
                id: 11,
                type: 'single' as const,
                depth: 3,
                items: []
              }
            ]
          }
      ]
    },
    {
      id: 5,
      type: 'group' as const,
      depth: 1,
      items: [
          {
            id: 6,
            type: 'group' as const,
            depth: 2,
            items: []
          },
          {
            id: 7,
            type: 'single' as const,
            depth: 2,
            items: []
          }
      ]
    },
    {
      id: 8,
      type: 'single' as const,
      depth: 1,
      items: []
    }
  ];