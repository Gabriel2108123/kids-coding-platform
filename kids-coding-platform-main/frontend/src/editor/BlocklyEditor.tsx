import React, { useEffect, useRef, useCallback } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import 'blockly/javascript';
import { initializeGameBlocks, getGameBlockCategories } from './GameBlocks';
import './BlocklyEditor.css';

interface LocalBlocklyEditorProps {
  ageGroup?: string;
  onCodeChange?: (code: string) => void;
  onChange?: (code: string, xml: string) => void;
  initialCode?: string;
  readOnly?: boolean;
  availableBlocks?: string[];
}

const BlocklyEditor: React.FC<LocalBlocklyEditorProps> = ({
  ageGroup = '7-10',
  onCodeChange,
  onChange,
  initialCode,
  readOnly = false,
  availableBlocks
}) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const isInitialized = useRef(false);

  // Memoize the code change handler to prevent unnecessary re-renders
  const handleCodeChange = useCallback((code: string, xml: string) => {
    if (onCodeChange) {
      onCodeChange(code);
    }
    if (onChange) {
      onChange(code, xml);
    }
  }, [onCodeChange, onChange]);

  useEffect(() => {
    // Prevent multiple initializations
    if (!blocklyDiv.current || isInitialized.current) return;

    // Mark as initialized to prevent re-initialization
    isInitialized.current = true;

    // Initialize custom game blocks
    initializeGameBlocks();

    // Get age-appropriate block categories
    const categories = getGameBlockCategories(ageGroup);

    // Debug: Log the categories to ensure they're loaded
    // console.log('Loading Blockly categories for age group:', ageGroup, categories);

    // Fallback to basic blocks if custom blocks fail to load
    const fallbackToolbox = {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Logic',
          colour: '#5B80A5',
          contents: [
            { kind: 'block', type: 'controls_if' },
            { kind: 'block', type: 'logic_compare' },
            { kind: 'block', type: 'logic_operation' },
            { kind: 'block', type: 'logic_negate' },
            { kind: 'block', type: 'logic_boolean' }
          ]
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#5BA55B',
          contents: [
            { kind: 'block', type: 'controls_repeat_ext' },
            { kind: 'block', type: 'controls_whileUntil' },
            { kind: 'block', type: 'controls_for' }
          ]
        },
        {
          kind: 'category',
          name: 'Math',
          colour: '#5B67A5',
          contents: [
            { kind: 'block', type: 'math_number' },
            { kind: 'block', type: 'math_arithmetic' },
            { kind: 'block', type: 'math_single' }
          ]
        },
        {
          kind: 'category',
          name: 'Text',
          colour: '#5BA58C',
          contents: [
            { kind: 'block', type: 'text' },
            { kind: 'block', type: 'text_join' },
            { kind: 'block', type: 'text_append' }
          ]
        }
      ]
    };

    // Create toolbox configuration
    const toolbox = categories && categories.length > 0 ? {
      kind: 'categoryToolbox',
      contents: categories
    } : fallbackToolbox;

    // Configure workspace for different age groups
    const workspaceConfig = {
      toolbox,
      collapse: ageGroup === '11-15', // Only older kids get collapse feature
      comments: ageGroup !== '4-6', // No comments for youngest group
      disable: false,
      maxBlocks: ageGroup === '4-6' ? 20 : ageGroup === '7-10' ? 50 : Infinity,
      trashcan: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      media: 'https://blockly-demo.appspot.com/static/media/',
      rtl: false,
      scrollbars: {
        horizontal: true,
        vertical: true
      },
      sounds: true,
      oneBasedIndex: true,
      readOnly: readOnly,
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true
        },
        drag: true,
        wheel: true
      },
      grid: {
        spacing: 20,
        length: 1,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: ageGroup !== '4-6', // No wheel zoom for youngest
        startScale: ageGroup === '4-6' ? 1.2 : 1.0, // Bigger blocks for little kids
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      theme: getAgeAppropriateTheme(ageGroup),
      renderer: 'geras' // Use stable renderer for reliable interaction
    };

    // Create workspace
    const workspace = Blockly.inject(blocklyDiv.current, workspaceConfig);
    workspaceRef.current = workspace;

    // Track test blocks to avoid disposal issues
    let testBlocks: Blockly.Block[] = [];
    let initializationComplete = false;

    // Ensure workspace is properly sized and interactive
    const initializeWorkspace = () => {
      if (initializationComplete) return;

      // Force workspace to be interactive
      workspace.markFocused();
      workspace.resizeContents();
      Blockly.svgResize(workspace);

      // Enable all interactions explicitly
      workspace.options.readOnly = false;

      // Force a reflow to ensure proper sizing
      try {
        const canvas = workspace.getCanvas();
        canvas.setAttribute('width', blocklyDiv.current!.clientWidth.toString());
        canvas.setAttribute('height', blocklyDiv.current!.clientHeight.toString());

        // Ensure canvas has proper pointer events
        canvas.style.pointerEvents = 'auto';
      } catch (error) {
        // Canvas size setting failed, but workspace should still work
      }

      // Test workspace interaction only once, but ensure workspace is fully ready
      try {
        // Wait for workspace to be fully rendered
        if (workspace.getCanvas() && workspace.getToolbox()) {
          // Skip test block creation for now to avoid headless workspace errors
          // const testBlock = workspace.newBlock('math_number');
          // testBlock.setFieldValue('42', 'NUM');
          // testBlock.initSvg();
          // testBlock.render();
          // testBlock.moveBy(50, 50);

          // Add to tracking array
          // testBlocks.push(testBlock);

          // Verify block interaction works
          // testBlock.setMovable(true);
          // testBlock.setDeletable(true);
          // testBlock.setEditable(true);

          // Test passed - mark initialization as complete
          initializationComplete = true;

          // Clean up test block safely
          // setTimeout(() => {
          //   cleanupTestBlocks();
          // }, 2000);
        }
      } catch (error) {
        // Workspace interaction test failed, but continue
        initializationComplete = true; // Mark as complete even if test failed
      }
    };

    // Safe cleanup function for test blocks
    const cleanupTestBlocks = () => {
      testBlocks.forEach(block => {
        try {
          if (block && !block.isDisposed() && workspace.getBlockById(block.id)) {
            // Ensure block is properly removed from workspace before disposal
            workspace.removeTopBlock(block);
            block.dispose(false); // false = don't heal stack
          }
        } catch (error) {
          // Block disposal failed, but continue cleanup
        }
      });
      testBlocks = [];
    };

    // Initialize workspace with proper timing to ensure full readiness
    const initWithFallback = () => {
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        initializeWorkspace();
        // Only retry if initialization wasn't successful
        if (!initializationComplete) {
          setTimeout(() => {
            if (!initializationComplete) {
              initializeWorkspace();
            }
          }, 500);
        }
      }, 100);
    };

    initWithFallback();

    // Load initial code if provided
    if (initialCode && !isInitialized.current) {
      try {
        const dom = Blockly.utils.xml.textToDom(initialCode);
        Blockly.Xml.domToWorkspace(dom, workspace);
      } catch (e) {
        console.error('Failed to load initial blocks', e);
      }
    }

    // Add change listener for code generation
    workspace.addChangeListener(() => {
      const code = javascriptGenerator.workspaceToCode(workspace);
      const xmlDom = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToText(xmlDom);
      handleCodeChange(code, xmlText);
    });

    // Add starter blocks for younger children (temporarily disabled to fix headless workspace errors)
    // if (ageGroup === '4-6') {
    //   setTimeout(() => {
    //     if (workspace && workspaceRef.current) {
    //       addStarterBlocks(workspace);
    //     }
    //   }, 1000); // Increased delay to ensure workspace is fully ready
    // }

    return () => {
      // Clean up test blocks before disposing workspace
      cleanupTestBlocks();

      // Dispose workspace safely
      try {
        if (workspace) {
          workspace.dispose();
        }
      } catch (error) {
        // Workspace disposal failed, but continue
      }

      // Reset initialization flag for potential re-mount
      isInitialized.current = false;
    };
  }, [ageGroup, handleCodeChange]);

  return (
    <div className="h-full w-full">
      <div
        ref={blocklyDiv}
        className="h-full w-full blockly-workspace"
        style={{
          minHeight: '580px',
          height: '580px',
          position: 'relative',
          overflow: 'visible',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}
      />
    </div>
  );
};

// Create age-appropriate themes
const getAgeAppropriateTheme = (ageGroup: string) => {
  const baseTheme = Blockly.Theme.defineTheme('kidsTheme', {
    name: 'kidsTheme',
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: ageGroup === '4-6' ? '#f0f8ff' : '#ffffff',
      toolboxBackgroundColour: '#e8f4f8',
      toolboxForegroundColour: '#000000',
      flyoutBackgroundColour: '#f9f9f9',
      flyoutForegroundColour: '#000000',
      flyoutOpacity: 0.8,
      scrollbarColour: '#797979',
      insertionMarkerColour: '#000000',
      insertionMarkerOpacity: 0.3,
      scrollbarOpacity: 0.4,
      cursorColour: '#d0d0d0'
    },
    blockStyles: {
      colour_blocks: { colourPrimary: '#a5745b' },
      list_blocks: { colourPrimary: '#745ba5' },
      logic_blocks: { colourPrimary: '#5b80a5' },
      loop_blocks: { colourPrimary: '#5ba55b' },
      math_blocks: { colourPrimary: '#5b67a5' },
      procedure_blocks: { colourPrimary: '#995ba5' },
      text_blocks: { colourPrimary: '#5ba58c' },
      variable_blocks: { colourPrimary: '#a55b99' }
    },
    categoryStyles: {
      colour_category: { colour: '#a5745b' },
      list_category: { colour: '#745ba5' },
      logic_category: { colour: '#5b80a5' },
      loop_category: { colour: '#5ba55b' },
      math_category: { colour: '#5b67a5' },
      procedure_category: { colour: '#995ba5' },
      text_category: { colour: '#5ba58c' },
      variable_category: { colour: '#a55b99' }
    }
  });

  return baseTheme;
};

// Add helpful starter blocks for youngest children (temporarily disabled)
// const addStarterBlocks = (workspace: Blockly.WorkspaceSvg) => {
//   try {
//     // Use basic blocks that are guaranteed to exist
//     const xml = `
//       <xml>
//         <block type="variables_set" x="20" y="20">
//           <field name="VAR">myVariable</field>
//           <value name="VALUE">
//             <block type="math_number">
//               <field name="NUM">0</field>
//             </block>
//           </value>
//         </block>
//         <block type="controls_if" x="20" y="120">
//           <value name="IF0">
//             <block type="logic_boolean">
//               <field name="BOOL">TRUE</field>
//             </block>
//           </value>
//         </block>
//       </xml>
//     `;

//     // Ensure workspace is ready before adding blocks
//     if (workspace && workspace.getCanvas()) {
//       const dom = Blockly.utils.xml.textToDom(xml);
//       Blockly.Xml.domToWorkspace(dom, workspace);
//     }
//   } catch (error) {
//     // Failed to add starter blocks, but continue - this is not critical
//   }
// };

export default BlocklyEditor;
