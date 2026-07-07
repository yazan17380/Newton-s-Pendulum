import * as THREE from 'three';


export function setupPendulumInteraction(initialPivots, camera, domElement, controls = null) {

  domElement.style.touchAction = 'none';

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();

  let pivots = initialPivots;
  let ballMeshes = pivots.map((p) => p.ball);

  const draggingPivots = new Map();

  const selectedPivots = new Set();

  function setSelectedVisual(pivotData, isSelected) {
    if (!pivotData._selectionRing) {
      const majorR = pivotData.radius * 1.04;
      const tubeR = pivotData.radius * 0.045;
      const geo = new THREE.TorusGeometry(majorR, tubeR, 16, 48);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(geo, mat);

      ring.visible = false;
      pivotData.ball.add(ring);
      pivotData._selectionRing = ring;
    }
    pivotData._selectionRing.visible = isSelected;
  }

  function updatePointerNDC(event) {
    const rect = domElement.getBoundingClientRect();
    pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  const attachWorldPos = new THREE.Vector3();

  function getAttachWorldPosition(pivot) {
    pivot.pivot.getWorldPosition(attachWorldPos);
    return attachWorldPos;
  }

  function getPlaneIntersection(pivot) {
    const attach = getAttachWorldPosition(pivot);
    const restY = attach.y - pivot.length;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -restY);

    raycaster.setFromCamera(pointerNDC, camera);
    const point = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(plane, point);
    return hit ? point : null;
  }

  function onPointerDown(event) {
    updatePointerNDC(event);
    raycaster.setFromCamera(pointerNDC, camera);

    const hits = raycaster.intersectObjects(ballMeshes, false);

    if (hits.length === 0) {

      if (!event.shiftKey) {
        for (const p of selectedPivots) setSelectedVisual(p, false);
        selectedPivots.clear();
      }
      return;
    }

    const pivotData = pivots.find((p) => p.ball === hits[0].object);
    if (!pivotData) return;

    for (const drag of draggingPivots.values()) {
      if (drag.members.some((m) => m.pivot === pivotData)) return;
    }

    if (event.shiftKey) {
      if (selectedPivots.has(pivotData)) {
        selectedPivots.delete(pivotData);
        setSelectedVisual(pivotData, false);
      } else {
        selectedPivots.add(pivotData);
        setSelectedVisual(pivotData, true);
      }
      return;
    }

    let groupPivots;
    if (selectedPivots.has(pivotData) && selectedPivots.size > 1) {
      groupPivots = Array.from(selectedPivots);
    } else {
      for (const p of selectedPivots) setSelectedVisual(p, false);
      selectedPivots.clear();
      selectedPivots.add(pivotData);
      groupPivots = [pivotData];
    }

    const members = groupPivots.map((p) => ({
      pivot: p,
      posOffset: p.localPos.clone().sub(pivotData.localPos),
    }));

    for (const p of groupPivots) {
      p.isDragging = true;
      p.localVel.set(0, 0, 0);

      p._dragFrames = 0;
      p._prevLocalPos = p.localPos.clone();
    }

    draggingPivots.set(event.pointerId, { anchor: pivotData, members });

    if (domElement.setPointerCapture) {
      try {
        domElement.setPointerCapture(event.pointerId);
      } catch (e) {
      }
    }

    if (controls) controls.enabled = false;

    domElement.style.cursor = 'grabbing';
  }

  function onPointerMove(event) {
    const drag = draggingPivots.get(event.pointerId);
    if (!drag) return;

    updatePointerNDC(event);

    const point = getPlaneIntersection(drag.anchor);
    if (!point) return;

    const L = drag.anchor.length;
    const attach = getAttachWorldPosition(drag.anchor);
    let dx = point.x - attach.x;
    let dz = point.z - attach.z;

    if (!event.altKey) {
      dz = 0;
    }

    const maxHorizSq = L * L * 0.98;
    const horizSq = dx * dx + dz * dz;
    if (horizSq > maxHorizSq) {
      const scale = Math.sqrt(maxHorizSq / horizSq);
      dx *= scale;
      dz *= scale;
    }

    const dy = -Math.sqrt(Math.max(L * L - dx * dx - dz * dz, 0));

    for (const member of drag.members) {
      member.pivot.localPos
        .set(dx + member.posOffset.x, dy + member.posOffset.y, dz + member.posOffset.z)
        .setLength(member.pivot.length);
    }
  }

  function onPointerUp(event) {
    const drag = draggingPivots.get(event.pointerId);
    if (!drag) return;

    for (const member of drag.members) {
      member.pivot.isDragging = false;
    }
    draggingPivots.delete(event.pointerId);

    if (domElement.releasePointerCapture) {
      try {
        domElement.releasePointerCapture(event.pointerId);
      } catch (e) {
      }
    }

    if (draggingPivots.size === 0) {
      domElement.style.cursor = 'auto';
      if (controls) controls.enabled = true;
    }
  }

  domElement.addEventListener('pointerdown', onPointerDown);
  domElement.addEventListener('pointermove', onPointerMove);
  domElement.addEventListener('pointerup', onPointerUp);
  domElement.addEventListener('pointerleave', onPointerUp);

  return {
    setPivots(newPivots) {
      pivots = newPivots;
      ballMeshes = pivots.map((p) => p.ball);
      draggingPivots.clear();
      selectedPivots.clear();
    },
  };
}
