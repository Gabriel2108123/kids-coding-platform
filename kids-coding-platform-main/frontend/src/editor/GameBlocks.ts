import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define custom game-focused blocks for different age groups

// Simple game blocks for ages 4-6
export const initializeGameBlocks = () => {
  
  // Click Event Block
  Blockly.Blocks['game_on_click'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🖱️ when clicked');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('do');
      this.setColour('#FF6B6B');
      this.setTooltip('Runs code when something is clicked');
      this.setHelpUrl('');
    }
  };

  javascriptGenerator.forBlock['game_on_click'] = function(block: any) {
    const statements_do = javascriptGenerator.statementToCode(block, 'DO');
    return `// On click event\nfunction onClick() {\n${statements_do}}\n`;
  };

  // Change Color Block
  Blockly.Blocks['game_change_color'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🌈 change color to')
        .appendField(new Blockly.FieldDropdown([
          ['🔴 red', '#ff0000'],
          ['🟢 green', '#00ff00'],
          ['🔵 blue', '#0000ff'],
          ['🟡 yellow', '#ffff00'],
          ['🟣 purple', '#ff00ff'],
          ['🟠 orange', '#ff8000']
        ]), 'COLOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9C88FF');
      this.setTooltip('Changes the color of the sprite');
    }
  };

  javascriptGenerator.forBlock['game_change_color'] = function(block: any) {
    const colour_color = block.getFieldValue('COLOR');
    return `sprite.tint = ${colour_color};\n`;
  };

  // Play Sound Block
  Blockly.Blocks['game_play_sound'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🔊 play sound')
        .appendField(new Blockly.FieldDropdown([
          ['🐱 meow', 'meow'],
          ['🐶 woof', 'woof'],
          ['🎵 beep', 'beep'],
          ['👏 clap', 'clap'],
          ['🎉 cheer', 'cheer']
        ]), 'SOUND');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4ECDC4');
      this.setTooltip('Plays a fun sound effect');
    }
  };

  javascriptGenerator.forBlock['game_play_sound'] = function(block: any) {
    const dropdown_sound = block.getFieldValue('SOUND');
    return `playSound('${dropdown_sound}');\n`;
  };

  // Score Block
  Blockly.Blocks['game_add_score'] = {
    init: function() {
      this.appendValueInput('POINTS')
        .setCheck('Number')
        .appendField('⭐ add to score');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FFE66D');
      this.setTooltip('Adds points to the player score');
    }
  };

  javascriptGenerator.forBlock['game_add_score'] = function(block: any) {
    const value_points = javascriptGenerator.valueToCode(block, 'POINTS', 0);
    return `score += ${value_points || 1};\nupdateScoreDisplay();\n`;
  };

  // Movement Blocks for Ages 7-10
  Blockly.Blocks['game_move_sprite'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🚀 move sprite')
        .appendField(new Blockly.FieldDropdown([
          ['⬆️ up', 'up'],
          ['⬇️ down', 'down'],
          ['⬅️ left', 'left'],
          ['➡️ right', 'right']
        ]), 'DIRECTION');
      this.appendValueInput('DISTANCE')
        .setCheck('Number')
        .appendField('by');
      this.appendDummyInput()
        .appendField('steps');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#45B7D1');
      this.setTooltip('Moves the sprite in a direction');
    }
  };

  javascriptGenerator.forBlock['game_move_sprite'] = function(block: any) {
    const dropdown_direction = block.getFieldValue('DIRECTION');
    const value_distance = javascriptGenerator.valueToCode(block, 'DISTANCE', 0) || '10';
    
    const directionCode = {
      'up': `sprite.y -= ${value_distance};`,
      'down': `sprite.y += ${value_distance};`,
      'left': `sprite.x -= ${value_distance};`,
      'right': `sprite.x += ${value_distance};`
    };
    
    return `${directionCode[dropdown_direction as keyof typeof directionCode]}\n`;
  };

  // Collision Detection Block
  Blockly.Blocks['game_if_touching'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🤝 if touching')
        .appendField(new Blockly.FieldDropdown([
          ['🏆 goal', 'goal'],
          ['💎 treasure', 'treasure'],
          ['🚧 wall', 'wall'],
          ['👾 enemy', 'enemy']
        ]), 'TARGET');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('then');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#5CB3CC');
      this.setTooltip('Checks if sprite is touching something');
    }
  };

  javascriptGenerator.forBlock['game_if_touching'] = function(block: any) {
    const dropdown_target = block.getFieldValue('TARGET');
    const statements_do = javascriptGenerator.statementToCode(block, 'DO');
    return `if (checkCollision('${dropdown_target}')) {\n${statements_do}}\n`;
  };

  // Game Objects for Ages 11-15
  Blockly.Blocks['game_create_sprite'] = {
    init: function() {
      this.appendValueInput('X')
        .setCheck('Number')
        .appendField('🎮 create sprite at x:');
      this.appendValueInput('Y')
        .setCheck('Number')
        .appendField('y:');
      this.appendDummyInput()
        .appendField('type:')
        .appendField(new Blockly.FieldDropdown([
          ['🟦 player', 'player'],
          ['💎 collectible', 'collectible'],
          ['🚧 obstacle', 'obstacle'],
          ['🏆 goal', 'goal']
        ]), 'TYPE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9B59B6');
      this.setTooltip('Creates a new sprite in the game');
    }
  };

  javascriptGenerator.forBlock['game_create_sprite'] = function(block: any) {
    const value_x = javascriptGenerator.valueToCode(block, 'X', 0) || '0';
    const value_y = javascriptGenerator.valueToCode(block, 'Y', 0) || '0';
    const dropdown_type = block.getFieldValue('TYPE');
    return `createSprite(${value_x}, ${value_y}, '${dropdown_type}');\n`;
  };

  // Variable Operations
  Blockly.Blocks['game_set_variable'] = {
    init: function() {
      this.appendValueInput('VALUE')
        .setCheck(['Number', 'String'])
        .appendField('📊 set')
        .appendField(new Blockly.FieldVariable('score'), 'VAR')
        .appendField('to');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FF9F43');
      this.setTooltip('Sets a variable to a value');
    }
  };

  javascriptGenerator.forBlock['game_set_variable'] = function(block: any) {
    const variable_var = block.getFieldValue('VAR');
    const value_value = javascriptGenerator.valueToCode(block, 'VALUE', 0) || '0';
    return `${variable_var} = ${value_value};\n`;
  };

  // Loop Block with Visual Elements
  Blockly.Blocks['game_repeat_with_animation'] = {
    init: function() {
      this.appendValueInput('TIMES')
        .setCheck('Number')
        .appendField('🔄 repeat');
      this.appendDummyInput()
        .appendField('times with animation');
      this.appendStatementInput('DO')
        .setCheck(null)
        .appendField('do');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#26DE81');
      this.setTooltip('Repeats actions with smooth animation');
    }
  };

  javascriptGenerator.forBlock['game_repeat_with_animation'] = function(block: any) {
    const value_times = javascriptGenerator.valueToCode(block, 'TIMES', 0) || '1';
    const statements_do = javascriptGenerator.statementToCode(block, 'DO');
    return `for (let i = 0; i < ${value_times}; i++) {\n  await sleep(100);\n${statements_do}}\n`;
  };

  // Text Display Block
  Blockly.Blocks['game_show_text'] = {
    init: function() {
      this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('💬 show message');
      this.appendValueInput('TIME')
        .setCheck('Number')
        .appendField('for');
      this.appendDummyInput()
        .appendField('seconds');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#FD79A8');
      this.setTooltip('Shows text message on screen');
    }
  };

  javascriptGenerator.forBlock['game_show_text'] = function(block: any) {
    const value_text = javascriptGenerator.valueToCode(block, 'TEXT', 0) || '""';
    const value_time = javascriptGenerator.valueToCode(block, 'TIME', 0) || '2';
    return `showMessage(${value_text}, ${value_time} * 1000);\n`;
  };

  // Level Management
  Blockly.Blocks['game_next_level'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🎊 go to next level');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#A29BFE');
      this.setTooltip('Advances to the next game level');
    }
  };

  javascriptGenerator.forBlock['game_next_level'] = function() {
    return 'nextLevel();\n';
  };

  // Game State Blocks
  Blockly.Blocks['game_win'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🏆 player wins!');
      this.setPreviousStatement(true, null);
      this.setColour('#00B894');
      this.setTooltip('Ends the game with a win');
    }
  };

  javascriptGenerator.forBlock['game_win'] = function() {
    return 'gameWin();\n';
  };

  Blockly.Blocks['game_lose'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('💔 game over');
      this.setPreviousStatement(true, null);
      this.setColour('#E17055');
      this.setTooltip('Ends the game with a loss');
    }
  };

  javascriptGenerator.forBlock['game_lose'] = function() {
    return 'gameOver();\n';
  };

  // Advanced blocks for older kids
  Blockly.Blocks['game_physics_gravity'] = {
    init: function() {
      this.appendValueInput('FORCE')
        .setCheck('Number')
        .appendField('🌍 set gravity to');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#6C5CE7');
      this.setTooltip('Sets the gravity force for physics');
    }
  };

  javascriptGenerator.forBlock['game_physics_gravity'] = function(block: any) {
    const value_force = javascriptGenerator.valueToCode(block, 'FORCE', 0) || '0.5';
    return `setGravity(${value_force});\n`;
  };

  Blockly.Blocks['game_ai_follow'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🤖 make AI follow player');
      this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('at speed');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E84393');
      this.setTooltip('Makes AI character follow the player');
    }
  };

  javascriptGenerator.forBlock['game_ai_follow'] = function(block: any) {
    const value_speed = javascriptGenerator.valueToCode(block, 'SPEED', 0) || '1';
    return `aiFollowPlayer(${value_speed});\n`;
  };
};

// Helper function to get age-appropriate block categories
export const getGameBlockCategories = (ageGroup: string) => {
  const categories = {
    '4-6': [
      {
        kind: 'category',
        name: '🎮 Game Events',
        colour: '#FF6B6B',
        contents: [
          { kind: 'block', type: 'game_on_click' }
        ]
      },
      {
        kind: 'category',
        name: '🌈 Looks',
        colour: '#9C88FF',
        contents: [
          { kind: 'block', type: 'game_change_color' }
        ]
      },
      {
        kind: 'category',
        name: '🔊 Sounds',
        colour: '#4ECDC4',
        contents: [
          { kind: 'block', type: 'game_play_sound' }
        ]
      },
      {
        kind: 'category',
        name: '⭐ Score',
        colour: '#FFE66D',
        contents: [
          { kind: 'block', type: 'game_add_score' },
          { kind: 'block', type: 'math_number' }
        ]
      }
    ],
    '7-10': [
      {
        kind: 'category',
        name: '🎮 Game Events',
        colour: '#FF6B6B',
        contents: [
          { kind: 'block', type: 'game_on_click' }
        ]
      },
      {
        kind: 'category',
        name: '🚀 Movement',
        colour: '#45B7D1',
        contents: [
          { kind: 'block', type: 'game_move_sprite' }
        ]
      },
      {
        kind: 'category',
        name: '🤝 Collision',
        colour: '#5CB3CC',
        contents: [
          { kind: 'block', type: 'game_if_touching' }
        ]
      },
      {
        kind: 'category',
        name: '🔄 Loops',
        colour: '#26DE81',
        contents: [
          { kind: 'block', type: 'game_repeat_with_animation' },
          { kind: 'block', type: 'controls_repeat_ext' }
        ]
      },
      {
        kind: 'category',
        name: '📊 Variables',
        colour: '#FF9F43',
        contents: [
          { kind: 'block', type: 'game_set_variable' }
        ]
      },
      {
        kind: 'category',
        name: '💬 Text',
        colour: '#FD79A8',
        contents: [
          { kind: 'block', type: 'game_show_text' },
          { kind: 'block', type: 'text' }
        ]
      }
    ],
    '11-15': [
      {
        kind: 'category',
        name: '🎮 Game Objects',
        colour: '#9B59B6',
        contents: [
          { kind: 'block', type: 'game_create_sprite' },
          { kind: 'block', type: 'game_on_click' }
        ]
      },
      {
        kind: 'category',
        name: '🚀 Movement & Physics',
        colour: '#6C5CE7',
        contents: [
          { kind: 'block', type: 'game_move_sprite' },
          { kind: 'block', type: 'game_physics_gravity' }
        ]
      },
      {
        kind: 'category',
        name: '🤖 AI & Logic',
        colour: '#E84393',
        contents: [
          { kind: 'block', type: 'game_ai_follow' },
          { kind: 'block', type: 'game_if_touching' },
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' }
        ]
      },
      {
        kind: 'category',
        name: '🏆 Game State',
        colour: '#00B894',
        contents: [
          { kind: 'block', type: 'game_win' },
          { kind: 'block', type: 'game_lose' },
          { kind: 'block', type: 'game_next_level' }
        ]
      },
      {
        kind: 'category',
        name: '📊 Data',
        colour: '#FF9F43',
        contents: [
          { kind: 'block', type: 'game_set_variable' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_number' }
        ]
      },
      {
        kind: 'category',
        name: '🔄 Advanced Loops',
        colour: '#26DE81',
        contents: [
          { kind: 'block', type: 'game_repeat_with_animation' },
          { kind: 'block', type: 'controls_repeat_ext' },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_for' }
        ]
      }
    ]
  };

  return categories[ageGroup as keyof typeof categories] || categories['7-10'];
};
