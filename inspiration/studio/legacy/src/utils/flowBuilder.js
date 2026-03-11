// import { getNodeSrc } from "@oute/oute-ds.atom.canvas";

// export const appendIdToNodes = async (nodes) => {
//   const nodesWithId = [];

//   for (let i = 0; i < nodes.length; i++) {
//     const src = await getNodeSrc(nodes[i]);
//     const qObj = {
//       ...nodes[i],
//       id: nodes[i].id,
//       _id: nodes[i].id,
//       _src: src,
//     };
//     nodesWithId.push(qObj);
//   }
//   return nodesWithId;
// };

// export const createNodes = async ({
//   nodes,
//   onAddNewNodeHandler,
//   autoSaveNodeDataHandler,
//   canvasRef,
// }) => {
//   const transformedNodes = await appendIdToNodes(nodes);
//   const addedNodes = [];
//   for (let i = 0; i < transformedNodes.length; i++) {
//     const node = await onAddNewNodeHandler(transformedNodes[i], {
//       openDialog: false,
//     });
//     addedNodes.push(node);
//     await autoSaveNodeDataHandler(
//       node?.part?.data,
//       transformedNodes[i]?.go_data,
//     );
//     if (i > 0) {
//       await canvasRef.current?.createLink({
//         from: addedNodes[i - 1].data.key,
//         to: node.key,
//       });
//     }
//   }
//   await canvasRef.current.autoAlign();
// };

export const createNodes = async ({
  transformedNodes,
  transformedLinkData,
  saveNodeDataHandler,
  canvasRef,
  checkReferences, // Add optional callback
}) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[createNodes] DEBUG - Creating nodes:', {
        nodeCount: transformedNodes.length,
        firstNode: transformedNodes[0] ? {
          key: transformedNodes[0].key,
          type: transformedNodes[0].type,
          hasGoData: !!transformedNodes[0].go_data,
          goDataKeys: transformedNodes[0].go_data ? Object.keys(transformedNodes[0].go_data) : [],
          allKeys: Object.keys(transformedNodes[0] || {}),
        } : null,
      });
    }

    for (const node of transformedNodes) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[createNodes] DEBUG - Creating node:', {
          key: node.key,
          type: node.type,
          template: node.template,
          module: node.module,
          _src: node._src,
          hasGoData: !!node.go_data,
          allKeys: Object.keys(node || {}),
        });
      }

      const newNode = canvasRef.current.createNode(node);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[createNodes] DEBUG - Node created:', {
          key: newNode?.key,
          data: newNode?.data,
          template: newNode?.data?.template,
          module: newNode?.data?.module,
          _src: newNode?.data?._src,
          hasData: !!newNode?.data,
        });
      }

      // Ensure go_data has last_updated to trigger transformation
      const goDataWithLastUpdated = {
        ...(newNode?.data?.go_data || {}),
        last_updated: newNode?.data?.go_data?.last_updated || Date.now(),
      };

      await saveNodeDataHandler(
        newNode?.data,
        goDataWithLastUpdated,
        {
          errors: node?.errors || [],
          warnings: node?.warnings || [],
        },
        true,  // openNodeAfterCreate
        false, // updateReferences - SKIP during batch creation
        true   // shouldUpdateLabelReferences
      );
    }
    
    // Call checkReferences once after all nodes are created
    // This ensures all nodes exist before validation
    if (checkReferences && typeof checkReferences === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[createNodes] Calling checkReferences after all nodes created');
      }
      checkReferences();
    }
    
    for (const link of transformedLinkData) {
      let shouldCreateLink = false; // Default to false

      for (const node of transformedNodes) {
        if (node?.type === "IFELSE_V2" && link?.from === node?.key) {
          shouldCreateLink = false;
          break; // Exit loop immediately
        }
        if (node.key === link?.to) {
          shouldCreateLink = true;
          break; // Stop iteration early if condition is met
        }
      }

      if (!shouldCreateLink) {
        continue;
      }
      await canvasRef.current.createLink(link);
    }
  } catch (e) {
    console.error("error:", e, e.message);
  } finally {
    canvasRef.current.autoAlign();
  }
};
