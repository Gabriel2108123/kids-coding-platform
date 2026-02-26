import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { initializeGameBlocks, getGameBlockCategories } from './GameBlocks';

interface EnhancedBlocklyEditorProps {
  ageGroup: string;
  onCodeChange?: (code: string) => void;
}

const EnhancedBlocklyEditor: React.FC<EnhancedBlocklyEditorProps> = ({ ageGroup, onCodeChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Initialize custom game blocks
    initializeGameBlocks();

    // Get age-appropriate block categories
    const categories = getGameBlockCategories(ageGroup);

    // Create toolbox configuration
    const toolbox = {
      kind: 'categoryToolbox',
      contents: categories
    };

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
      scrollbars: true,
      sounds: true,
      oneBasedIndex: true,
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
      theme: getAgeAppropriateTheme(ageGroup)
    };

    // Create workspace
    const workspace = Blockly.inject(blocklyDiv.current, workspaceConfig);
    workspaceRef.current = workspace;

    // Add change listener for code generation
    workspace.addChangeListener(() => {
      if (onCodeChange) {
        const code = javascriptGenerator.workspaceToCode(workspace);
        onCodeChange(code);
      }
    });

    // Add starter blocks for younger children
    if (ageGroup === '4-6') {
      addStarterBlocks(workspace);
    }

    return () => {
      workspace.dispose();
    };
  }, [ageGroup, onCodeChange]);

  return (
    <div className="h-full w-full">
      <div 
        ref={blocklyDiv} 
        className="h-full w-full rounded-lg shadow-inner"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

// Create age-appropriate themes
const getAgeAppropriateTheme = (ageGroup: string) => {
  return Blockly.Theme.defineTheme('kidsTheme', {
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
};

// Add helpful starter blocks for youngest children
const addStarterBlocks = (workspace: Blockly.WorkspaceSvg) => {
  const xml = `
    <xml>
      <block type="game_on_click" x="20" y="20">
        <statement name="DO">
          <block type="game_play_sound">
            <field name="SOUND">beep</field>
          </block>
        </statement>
      </block>
    </xml>
  `;
  
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
};

export default EnhancedBlocklyEditor;
