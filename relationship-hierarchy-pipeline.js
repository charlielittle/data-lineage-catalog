[
  {
    $match: { sourceNodeId: "customer_master_id"}
  },
  {
    $graphLookup:
      /**
       * from: The target collection.
       * startWith: Expression to start.
       * connectFromField: Field to connect.
       * connectToField: Field to connect to.
       * as: Name of the array field.
       * maxDepth: Optional max recursion depth.
       * depthField: Optional Name of the depth field.
       * restrictSearchWithMatch: Optional query filter.
       */
      {
        from: "relationships",
        startWith: "$sourceNodeId",
        connectFromField: "targetNodeId",
        connectToField: "sourceNodeId",
        as: "graph",
        // maxDepth: number,
        depthField: "depth",
        restrictSearchWithMatch: {
          status: "active"
        }
      }
  },
  {
    $addFields:
      /**
       * sort the hierarchy by depth,
       * project only limited fields in hierarchy
       */
      {
        graph: { $map: { input: {
              $sortArray: { input: "$graph", sortBy: { depth: 1 } }
            },
            as: "i",
            in: {
              relationshipId: "$$i.relationshipId",
              sourceNodeId: "$$i.sourceNodeId",
              targetNodeId: "$$i.targetNodeId",
              depth: "$$i.depth"
            }
          }
        }
      }
  },
  {
    $project:
      {
        _id: 0,
        sourceNodeId: 1,
        targetNodeId: 1,
        relationshipId: 1,
        relationshipType: 1,
        graph: 1
      }
  }
]