/**
 * Remaps fields that were randomly renamed in the bundle.
 * This is because, while Vape for Miniblox was still maintained, vector was renaming fields to random stuff.
 * xylex's solution (see https://codeberg.org/RealPacket/VapeForMiniblox/commit/30c4233603ee53e3bdcc445da0bdd6b2e1b1b617) was to use regexes
 * to find the field's random name, and in the replacement code, replace the dump name with the random name.
 * Figured it would happen like months or weeks before they renamed it, but he never listened;
 * And never made it not use such a brittle method of modifying such as replacing.
 * Later on when vector added the `jsContent` field to the bundle, it broke Vape for Miniblox entirely,
 * although that was probably way after Vape for Miniblox was discontinued or last updated.
 * Note that this isn't perfect, so it still can break.
 * I've added multiple more regexes, I probably should add those to Vape for Miniblox.
 * @module
*/

/**
 * Some regexes used to remap the bundle.
 * The 1st match is the name used.
 */
const REGEXES = {
	// PlayerMovement#applyInput
	moveForward: /this\.([a-zA-Z]+)=\([a-zA-Z]+\.(up|down)/m,
	moveStrafe: /this\.([a-zA-Z]+)=\+!!\w\.right\s*\+\s*\(\w\.left\s*\?\s*-1\s*:\s*0\)/m,
	// PathNavigateGround#isPositionClear
	iterator: /of\s*\w+\.([a-zA-Z]+)\(new/,
	// EntityBoat#update
	// normalizeAngle: /(\w+)\(this\.boatYaw\s*-\s*this.yaw\)/, // useless
	// PlayerMovement#updatePlayerMoveState
	applyInput: /this\.(\w+)\(this\.currentInput\)/,
	// false flags from some random method.
	// getMoveDirection: /([a-zA-Z]+)\(\w\)[\s\S]*?>=\s*1e-4[\s\S]*?Math\.cos\(this\.yaw\)/,
	updatePlayerMoveState: /this\.([a-zA-Z]*)\(\),\n*\s*this\.isUsingItem\(\)\s*&&/,
	getEyePos:
		/(\w+)\(\)\s*{\n*\s*let\s+\w\s*=\s*this\.pos\.clone\(\);\n*\s*return\s+\w.y\s*\+=\s*this\.getEyeHeight/,
	// BlockFenceGate#getStateForPlacement
	getHorizontalFacing: /return\s+this\.defaultState\.withState\(`facing`,\s*\w\.(\w+)\(\)\)/,
	// PlayerController#rightClickMouse
	onPlayerRightClick:
		/this\.(\w+)\(\s*\w+,\s*[^.]+\.world,\s*\w,\s*\w+,\s*\w\.side,\s*\w\.hitVec,?\s*,\s*\w\)/,
	// PlayerMovement#checkHeadInBlock
	// position:
	// 	/null;\s*\n*\s*let\s*\w\s*=\s*\w+\.fromVector\(\w+\.([a-zA-Z]+)\)/g,
	// PlayerControllerMP#updateMouseOver
	isInvisible: /this\.capeMesh\s*&&\s*this\.entity\.([a-zA-Z]+)\(\)/m,
	// EntityItem#update
	pushOutOfBlocks: /this\.noPhysics\s*=\s*this\.(\w+)\(this/,
	// attackTargetEntityWithCurrentItem, in PlayerController#attackEntity
	attack: /\w+\.(\w+)\(e\),\n*\s*\w+\.hit\(\)/,
	lastReportedYaw: /this\.([a-zA-Z]*)=this\.yaw,this\.last/m,
	windowClick: /([a-zA-Z]*)\(this\.inventorySlots\.windowId/m,
	damageReduceAmount: /\w\.item\.(\w+)\s*\|\|\s*0/,
	// playerControllerMP
	syncItem: /([a-zA-Z]*)\(\),\n*\s*\w+\.sendPacket\(new\s*/m,
	// GLTF manager
	gltfManager: /await \w+\.(\w+)\.getModel/,
	// AABB is in a separate module now, we can just scan for fields or code and find it ourselves.
	// Shader Manager
	addShaderToMaterialWorld:
		/static\s+(\w+)\(\w\)\s*\{\s*t\.userData\s*=\s*\{\s*time:\s*{\s*value:\s*2/,
	materialTransparentWorld: /this\.([a-zA-Z]*)\s*=\s*this\.materialTransparent\.clone\(/,
	potionAmplifiers: /\w+\.([a-zA-Z]+)\.set\(\w+\.([a-zA-Z]+)\.getId\(\),\s*`5`\)/,
	getFlag:
		/([a-zA-Z]+)\(([a-zA-Z]+)\)\s*{\s*\n*return\s*\(this\.dataWatcher\.getWatchableObjectByte\(0\)&1<<([a-zA-Z]+)\)!=0}/,
	setFlag: /setSprinting\(\w+\)\s*\{\n*\s*this\.([a-zA-Z]+)\([0-9]+,\s*([a-zA-Z]+)\)/,
	//EntityManager#shouldRenderEntity
	isInvisibleToPlayer:
		/!\w+\.world\.isBlockLoaded\(\w+\)\)\s*\|\|\s*!\w+\s*&&\s*\w+\.(\w+)\(\w+\)/m,
};

// pasted from Llama 3.3 70B on DuckDuckGo
export default function remap(text: string) {
    let remappedText = text;
    const matches: { [name: string]: string } = {};
    for (const [name, regex] of Object.entries(REGEXES)) {
        const match = remappedText.match(regex);
        if (match !== null && match[1] !== undefined) {
            matches[name] = match[1];
            console.log(`Remap ${name} -> ${match[1]}`);
        } else {
            console.warn(`Unmapped: ${name}`);
        }
    }
    for (const [name, match] of Object.entries(matches)) {
        remappedText = remappedText.replaceAll(match, name);
        console.log(`Remapping ${match} -> ${name}`);
    }
    return remappedText;
}



if (import.meta.main) {
	await Deno.readTextFile("./bundle.js")
	.then(remap)
	.then(result => Deno.writeTextFile("./bundle-remapped.js", result));
}
