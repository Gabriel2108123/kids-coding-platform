import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import 'blockly/javascript';

interface SimpleBlocklyEditorProps {
  onCodeChange?: (code: string) => void;
}

const SimpleBlocklyEditor: React.FC<SimpleBlocklyEditorProps> = ({ onCodeChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Simple toolbox with basic blocks
    const toolbox = {
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
            { kind: 'block', type: 'math_single' },
            { kind: 'block', type: 'math_trig' }
          ]
        },
        {
          kind: 'category',
          name: 'Text',
          colour: '#5BA58C',
          contents: [
            { kind: 'block', type: 'text' },
            { kind: 'block', type: 'text_join' },
            { kind: 'block', type: 'text_append' },
            { kind: 'block', type: 'text_length' }
          ]
        },
        {
          kind: 'category',
          name: 'Variables',
          colour: '#A55B99',
          custom: 'VARIABLE'
        },
        {
          kind: 'category',
          name: 'Functions',
          colour: '#995BA5',
          custom: 'PROCEDURE'
        }
      ]
    };

    // Basic workspace configuration
    const workspaceConfig = {
      toolbox,
      collapse: true,
      comments: true,
      disable: false,
      maxBlocks: Infinity,
      trashcan: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      media: 'https://blockly-demo.appspot.com/static/media/',
      rtl: false,
      scrollbars: true,
      sounds: true,
      oneBasedIndex: true,
      readOnly: false,
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
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      }
    };

    // Create workspace
    const workspace = Blockly.inject(blocklyDiv.current, workspaceConfig);
    workspaceRef.current = workspace;

    // Ensure proper sizing
    setTimeout(() => {
      workspace.resizeContents();
      Blockly.svgResize(workspace);
    }, 100);

    // Add change listener for code generation
    workspace.addChangeListener(() => {
      if (onCodeChange) {
        const code = javascriptGenerator.workspaceToCode(workspace);
        onCodeChange(code);
      }
    });

    // Add a simple starter block
    setTimeout(() => {
      const xml = `
        <xml>
          <block type="math_number" x="20" y="20">
            <field name="NUM">42</field>
          </block>
        </xml>
      `;
      try {
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
      } catch (error) {
        // Starter block failed to load, but workspace should still be interactive
      }
    }, 200);

    return () => {
      workspace.dispose();
    };
  }, [onCodeChange]);

  return (
    <div className="h-full w-full relative border-2 border-gray-200 rounded-lg">
      <div 
        ref={blocklyDiv} 
        className="h-full w-full"
        style={{ 
          minHeight: '500px',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default SimpleBlocklyEditor;
