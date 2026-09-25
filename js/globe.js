const Globe = (() => {
    const R = 5;
    const DEG = Math.PI / 180;
    const UP = new THREE.Vector3(0, 1, 0);

    let renderer, scene, camera, globeGroup, clock, sunLight;
    let atmosphereMat, landPoints, landMat, landBaseColors, landLatLon;
    let cityMat, clouds, cloudMat, sunSprite, sunCore, moon, ash;
    let container;
    const markers = {};
    const pawns = {};
    const crates = {};
    const routes = [];
    const effects = [];
    const hitMeshes = [];
    const satellites = [];
    let onClick = null;
    let onHover = null;
    let hovered = null;

    const cam = { lat: 25, lon: 10, dist: 17, tLat: 25, tLon: 10, tDist: 17 };
    const sun = { angle: 0.6, target: 0.6, base: 0.6 };
    let nightBase = 0.38;
    const world = { cityLights: 1, cityTarget: 1, winter: 0, winterTarget: 0 };
    let idleSpin = true;
    let shakeAmount = 0;
    let activePawnId = null;
    let travelSpeed = 1;
    let highlight = { current: null, near: [] };
    let cityPoints = null;
    let quality = 'high';
    const fpsMeter = { frames: 0, since: 0, fps: 60 };

    // ===== MATH HELPERS =====

    function latLonToVec(lat, lon, r = R) {
        const phi = (90 - lat) * DEG;
        const theta = (lon + 180) * DEG;
        return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }

    function vecToLatLon(v) {
        const n = v.clone().normalize();
        const lat = Math.asin(n.y) / DEG;
        let lon = Math.atan2(n.z, -n.x) / DEG - 180;
        if (lon < -180) lon += 360;
        return { lat, lon };
    }

    function slerpVec(a, b, t) {
        const an = a.clone().normalize();
        const bn = b.clone().normalize();
        const omega = an.angleTo(bn);
        if (omega < 1e-4) return an.lerp(bn, t).normalize();
        const s = Math.sin(omega);
        return an.multiplyScalar(Math.sin((1 - t) * omega) / s)
            .add(bn.multiplyScalar(Math.sin(t * omega) / s)).normalize();
    }

    function orientToNormal(obj, normal) {
        obj.quaternion.setFromUnitVectors(UP, normal.clone().normalize());
    }

    function tangentBasis(normal) {
        const n = normal.clone().normalize();
        let ref = new THREE.Vector3(0, 1, 0);
        if (Math.abs(n.dot(ref)) > 0.95) ref = new THREE.Vector3(1, 0, 0);
        const t1 = new THREE.Vector3().crossVectors(n, ref).normalize();
        const t2 = new THREE.Vector3().crossVectors(n, t1).normalize();
        return { t1, t2 };
    }

    function sunDir() {
        return new THREE.Vector3(Math.cos(sun.angle), 0.35, Math.sin(sun.angle)).normalize();
    }

    // ===== TEXTURES =====

    function circleTexture(soft = false) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        if (soft) {
            const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = grad;
        } else {
            g.fillStyle = '#fff';
        }
        g.beginPath();
        g.arc(32, 32, soft ? 32 : 28, 0, Math.PI * 2);
        g.fill();
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    let softCache = null;
    const softTex = () => (softCache = softCache || circleTexture(true));

    function cloudTexture() {
        const W = 512;
        const H = 256;
        const grid = 16;
        const lattice = [];
        for (let o = 0; o < 5; o++) {
            const gw = grid << o;
            const gh = (grid / 2) << o;
            const arr = new Float32Array((gw + 1) * (gh + 1));
            for (let i = 0; i < arr.length; i++) arr[i] = Math.random();
            lattice.push({ gw, gh, arr });
        }
        const smooth = t => t * t * (3 - 2 * t);
        function sample(o, x, y) {
            const { gw, gh, arr } = lattice[o];
            const fx = x * gw;
            const fy = y * gh;
            const x0 = Math.floor(fx);
            const y0 = Math.floor(fy);
            const tx = smooth(fx - x0);
            const ty = smooth(fy - y0);
            const idx = (xx, yy) => arr[(yy % (gh + 1)) * (gw + 1) + (xx % gw)];
            const a = idx(x0, y0) + (idx(x0 + 1, y0) - idx(x0, y0)) * tx;
            const b = idx(x0, y0 + 1) + (idx(x0 + 1, y0 + 1) - idx(x0, y0 + 1)) * tx;
            return a + (b - a) * ty;
        }
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        const g = c.getContext('2d');
        const img = g.createImageData(W, H);
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                let v = 0;
                let amp = 0.55;
                for (let o = 0; o < 5; o++) {
                    v += sample(o, x / W, y / H) * amp;
                    amp *= 0.5;
                }
                const a = Math.max(0, Math.min(1, (v - 0.52) * 3.2));
                const i = (y * W + x) * 4;
                img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
                img.data[i + 3] = a * 255;
            }
        }
        g.putImageData(img, 0, 0);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        return tex;
    }

    function makeCanvasSprite(w, h, scaleX, scaleY) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
        sprite.scale.set(scaleX, scaleY, 1);
        sprite.userData.canvas = c;
        return sprite;
    }

    function makeLabel(text, color, sub = '') {
        const sprite = makeCanvasSprite(512, 128, 2.6, 0.65);
        drawLabel(sprite, text, color, sub);
        return sprite;
    }

    function drawLabel(sprite, text, color, sub = '') {
        const c = sprite.userData.canvas;
        const g = c.getContext('2d');
        g.clearRect(0, 0, c.width, c.height);
        g.font = 'bold 44px -apple-system, "Segoe UI", system-ui, sans-serif';
        const w = Math.max(g.measureText(text).width, sub ? g.measureText(sub).width * 0.7 : 0) + 40;
        const x = (c.width - w) / 2;
        g.fillStyle = 'rgba(8, 12, 22, 0.78)';
        g.strokeStyle = color;
        g.lineWidth = 4;
        roundRect(g, x, 6, w, sub ? 112 : 64, 18);
        g.fill();
        g.stroke();
        g.fillStyle = color;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(text, c.width / 2, 38);
        if (sub) {
            g.font = 'bold 30px -apple-system, "Segoe UI", system-ui, sans-serif';
            g.fillStyle = '#cbd5e1';
            g.fillText(sub, c.width / 2, 88);
        }
        sprite.material.map.needsUpdate = true;
    }

    function makeTag(text, color, scale = 1) {
        const sprite = makeCanvasSprite(512, 96, 1.9 * scale, 0.36 * scale);
        const g = sprite.userData.canvas.getContext('2d');
        g.font = 'bold 46px -apple-system, "Segoe UI", system-ui, sans-serif';
        const w = Math.min(500, g.measureText(text).width + 36);
        const x = (512 - w) / 2;
        g.fillStyle = 'rgba(8, 12, 22, 0.85)';
        roundRect(g, x, 12, w, 72, 36);
        g.fill();
        g.lineWidth = 5;
        g.strokeStyle = color;
        g.stroke();
        g.fillStyle = '#ffffff';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(text, 256, 50);
        sprite.material.map.needsUpdate = true;
        return sprite;
    }

    function roundRect(g, x, y, w, h, r) {
        g.beginPath();
        g.moveTo(x + r, y);
        g.arcTo(x + w, y, x + w, y + h, r);
        g.arcTo(x + w, y + h, x, y + h, r);
        g.arcTo(x, y + h, x, y, r);
        g.arcTo(x, y, x + w, y, r);
        g.closePath();
    }

    function pointInPoly(lon, lat, pts) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [xi, yi] = pts[i];
            const [xj, yj] = pts[j];
            if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
    }

    function landAt(lat, lon) {
        if (lat < -68) return 'antarktis';
        for (const shape of LAND_SHAPES) {
            if (pointInPoly(lon, lat, shape.pts)) return shape.id;
        }
        return null;
    }

    // ===== SHADERS =====

    const dotVertex = `
        attribute vec3 aColor;
        uniform vec3 sunDir;
        uniform float size;
        uniform float scale;
        uniform float nightDim;
        varying vec3 vColor;
        varying float vLight;
        void main() {
            vec3 n = normalize(position);
            float d = dot(n, sunDir);
            vLight = mix(nightDim, 1.0, smoothstep(-0.2, 0.25, d));
            vColor = aColor;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (scale / -mv.z);
            gl_Position = projectionMatrix * mv;
        }`;

    const dotFragment = `
        varying vec3 vColor;
        varying float vLight;
        void main() {
            vec2 c = gl_PointCoord - 0.5;
            if (dot(c, c) > 0.2) discard;
            gl_FragColor = vec4(vColor * vLight, 1.0);
            #include <colorspace_fragment>
        }`;

    const cityVertex = `
        attribute float aSeed;
        uniform vec3 sunDir;
        uniform float size;
        uniform float scale;
        uniform float time;
        uniform float intensity;
        varying float vAlpha;
        void main() {
            vec3 n = normalize(position);
            float night = smoothstep(0.05, -0.3, dot(n, sunDir));
            float flicker = 0.75 + 0.25 * sin(time * (1.5 + aSeed * 3.0) + aSeed * 40.0);
            vAlpha = night * flicker * intensity;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (0.6 + aSeed * 0.8) * (scale / -mv.z);
            gl_Position = projectionMatrix * mv;
        }`;

    const cityFragment = `
        varying float vAlpha;
        void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = dot(c, c);
            if (d > 0.25) discard;
            float glow = 1.0 - d * 4.0;
            gl_FragColor = vec4(vec3(1.0, 0.78, 0.4) * glow, glow * vAlpha);
            #include <colorspace_fragment>
        }`;

    // ===== BUILD SCENE =====

    function init(el, handlers) {
        container = el;
        onClick = handlers.onClick;
        onHover = handlers.onHover;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.setClearColor(0x03050b);
        el.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000);
        clock = new THREE.Clock();

        scene.add(new THREE.AmbientLight(0x6677aa, 0.35));
        scene.add(new THREE.HemisphereLight(0x8899ff, 0x110805, 0.35));
        sunLight = new THREE.DirectionalLight(0xfff4e0, 2.4);
        scene.add(sunLight);
        scene.add(camera);

        globeGroup = new THREE.Group();
        scene.add(globeGroup);

        buildSpace();
        buildGlobe();
        buildLand();
        buildCities();
        buildClouds();
        buildLocations();
        buildRoutes();
        buildOrbiters();
        updateSun();

        bindInput();
        window.addEventListener('resize', resize);
        animate();
    }

    function buildSpace() {
        const n = 3500;
        const pos = new Float32Array(n * 3);
        const col = new Float32Array(n * 3);
        const c = new THREE.Color();
        for (let i = 0; i < n; i++) {
            const v = new THREE.Vector3().randomDirection().multiplyScalar(220 + Math.random() * 200);
            pos.set([v.x, v.y, v.z], i * 3);
            c.setHSL(0.55 + Math.random() * 0.2, 0.5, 0.65 + Math.random() * 0.35);
            col.set([c.r, c.g, c.b], i * 3);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
            size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.85,
        })));

        const nebulae = [['#6d28d9', -0.7, 0.3, 0.5], ['#1d4ed8', 0.8, -0.2, -0.6], ['#be185d', 0.1, 0.8, -0.9]];
        for (const [color, x, y, z] of nebulae) {
            const s = new THREE.Sprite(new THREE.SpriteMaterial({
                map: softTex(), color, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false,
            }));
            s.position.set(x, y, z).normalize().multiplyScalar(380);
            s.scale.set(320, 320, 1);
            scene.add(s);
        }

        sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: softTex(), color: 0xffd9a0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        sunSprite.scale.set(70, 70, 1);
        sunCore = new THREE.Sprite(new THREE.SpriteMaterial({
            map: softTex(), color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        sunCore.scale.set(16, 16, 1);
        scene.add(sunSprite, sunCore);
    }

    function buildGlobe() {
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(R * 0.995, 64, 64),
            new THREE.MeshPhongMaterial({ color: 0x0d1f45, emissive: 0x020612, shininess: 60, specular: 0x4466aa })
        );
        globeGroup.add(core);

        const grid = new THREE.LineSegments(
            new THREE.WireframeGeometry(new THREE.SphereGeometry(R * 1.001, 36, 18)),
            new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.045 })
        );
        globeGroup.add(grid);

        atmosphereMat = new THREE.ShaderMaterial({
            uniforms: { glowColor: { value: new THREE.Color(0x3b82f6) }, strength: { value: 1.0 } },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float strength;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5) * strength;
                    gl_FragColor = vec4(glowColor, 1.0) * intensity;
                }`,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.18, 64, 64), atmosphereMat));
    }

    function pointsUniforms(size) {
        return {
            sunDir: { value: sunDir() },
            size: { value: size },
            scale: { value: renderer.domElement.height / 2 },
        };
    }

    function buildLand() {
        const N = 18000;
        const golden = Math.PI * (3 - Math.sqrt(5));
        const positions = [];
        const colors = [];
        landLatLon = [];
        const col = new THREE.Color();

        for (let i = 0; i < N; i++) {
            const y = 1 - (i / (N - 1)) * 2;
            const lat = Math.asin(y) / DEG;
            const lon = ((golden * i) % (Math.PI * 2)) / DEG - 180;
            const land = landAt(lat, lon);
            if (!land) continue;
            const v = latLonToVec(lat, lon, R * 1.004);
            positions.push(v.x, v.y, v.z);
            col.set(LAND_COLORS[land]);
            const shade = 0.75 + Math.random() * 0.35;
            colors.push(col.r * shade, col.g * shade, col.b * shade);
            landLatLon.push(v.clone().normalize());
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
        landBaseColors = new Float32Array(colors);
        landMat = new THREE.ShaderMaterial({
            uniforms: { ...pointsUniforms(0.082), nightDim: { value: 0.32 } },
            vertexShader: dotVertex,
            fragmentShader: dotFragment,
        });
        landPoints = new THREE.Points(geo, landMat);
        globeGroup.add(landPoints);
    }

    function buildCities() {
        const positions = [];
        const seeds = [];
        const hubs = CONTINENT_IDS.map(id => LOCATIONS[id]).concat([
            { lat: 35, lon: 105 }, { lat: 22, lon: 78 }, { lat: 36, lon: 138 }, { lat: -33, lon: 150 }, { lat: 55, lon: 38 },
        ]);
        let guard = 0;
        while (positions.length < 1100 * 3 && guard++ < 40000) {
            let lat;
            let lon;
            if (Math.random() < 0.6) {
                const h = rand(hubs);
                lat = h.lat + (Math.random() - 0.5) * 22;
                lon = h.lon + (Math.random() - 0.5) * 30;
            } else {
                lat = -55 + Math.random() * 125;
                lon = -180 + Math.random() * 360;
            }
            const land = landAt(lat, lon);
            if (!land || land === 'antarktis') continue;
            const v = latLonToVec(lat, lon, R * 1.008);
            positions.push(v.x, v.y, v.z);
            seeds.push(Math.random());
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
        cityMat = new THREE.ShaderMaterial({
            uniforms: { ...pointsUniforms(0.16), time: { value: 0 }, intensity: { value: 1 } },
            vertexShader: cityVertex,
            fragmentShader: cityFragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        cityPoints = new THREE.Points(geo, cityMat);
        globeGroup.add(cityPoints);
    }

    function buildClouds() {
        cloudMat = new THREE.MeshPhongMaterial({
            map: cloudTexture(), transparent: true, opacity: 0.42, depthWrite: false, color: 0xffffff, shininess: 5,
        });
        clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.028, 64, 48), cloudMat);
        globeGroup.add(clouds);
    }

    function buildLocations() {
        for (const [id, loc] of Object.entries(LOCATIONS)) {
            const normal = latLonToVec(loc.lat, loc.lon, 1);
            const group = new THREE.Group();
            group.position.copy(normal.clone().multiplyScalar(R));
            orientToNormal(group, normal);

            const color = new THREE.Color(loc.color);
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(0.28, 0.38, 40),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.03;
            group.add(ring);

            const pulse = new THREE.Mesh(
                new THREE.RingGeometry(0.38, 0.45, 40),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
            );
            pulse.rotation.x = -Math.PI / 2;
            pulse.position.y = 0.04;
            group.add(pulse);

            let beam = null;
            let dome = null;
            let shield = null;
            let progress = null;
            if (loc.isBunker) {
                dome = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                    new THREE.MeshStandardMaterial({ color: 0x6b7280, metalness: 0.7, roughness: 0.3, emissive: color, emissiveIntensity: 0.25 })
                );
                group.add(dome);
                const hatch = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
                    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.4 })
                );
                hatch.position.y = 0.24;
                group.add(hatch);
                const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6), new THREE.MeshStandardMaterial({ color: 0x9ca3af }));
                antenna.position.set(0.15, 0.3, 0);
                const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3333 }));
                beacon.position.set(0.15, 0.48, 0);
                group.add(antenna, beacon);
                group.userData.beacon = beacon;
                shield = new THREE.Mesh(
                    new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
                    new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
                );
                group.add(shield);
                progress = new THREE.Mesh(
                    new THREE.RingGeometry(0.46, 0.54, 48, 1, 0, 0.001),
                    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide, depthWrite: false })
                );
                progress.rotation.x = -Math.PI / 2;
                progress.position.y = 0.05;
                progress.visible = false;
                group.add(progress);
            } else {
                beam = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.035, 0.09, 1.3, 12, 1, true),
                    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
                );
                beam.position.y = 0.65;
                group.add(beam);
                const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
                glow.scale.set(0.9, 0.9, 1);
                glow.position.y = 0.1;
                group.add(glow);
            }

            const sub = loc.isBunker ? 'Bunker' : `${CURRENCIES[loc.currency].name} · ${RESOURCES[loc.resource].name}`;
            const label = makeLabel(loc.name, loc.color, sub);
            label.position.y = loc.isBunker ? 1.0 : 1.75;
            group.add(label);

            const hit = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
            hit.position.y = 0.3;
            hit.userData.loc = id;
            group.add(hit);
            hitMeshes.push(hit);

            globeGroup.add(group);
            markers[id] = { group, ring, pulse, beam, dome, shield, progress, label, normal, available: true, baseColor: color, pops: 0 };
        }
    }

    function buildRoutes() {
        const seen = new Set();
        for (const [a, list] of Object.entries(ADJACENCY)) {
            for (const b of list) {
                const key = [a, b].sort().join('|');
                if (seen.has(key)) continue;
                seen.add(key);
                const pts = arcPath(markers[a].normal.clone().multiplyScalar(R * 1.01), markers[b].normal.clone().multiplyScalar(R * 1.01), 0.35);
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const line = new THREE.Line(geo, new THREE.LineDashedMaterial({
                    color: 0xffffff, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.14, depthWrite: false,
                }));
                line.computeLineDistances();
                const runner = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: softTex(), color: 0xfde047, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
                }));
                runner.scale.set(0.35, 0.35, 1);
                runner.visible = false;
                globeGroup.add(line, runner);
                routes.push({ a, b, pts, line, runner, phase: Math.random() });
            }
        }
    }

    function buildOrbiters() {
        moon = new THREE.Mesh(
            new THREE.SphereGeometry(1.1, 32, 32),
            new THREE.MeshPhongMaterial({ color: 0x9ca3af, emissive: 0x111111, shininess: 2 })
        );
        scene.add(moon);

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8, roughness: 0.3 });
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x1e3a8a, emissiveIntensity: 0.4, metalness: 0.5, side: THREE.DoubleSide });
        for (let i = 0; i < 4; i++) {
            const sat = new THREE.Group();
            sat.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.2), bodyMat));
            const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.12), panelMat);
            sat.add(panel);
            const blink = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: i % 2 ? 0xff4444 : 0x44ff88, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
            blink.scale.set(0.3, 0.3, 1);
            sat.add(blink);
            const axis = new THREE.Vector3().randomDirection();
            scene.add(sat);
            satellites.push({ sat, blink, axis, radius: 7 + i * 0.6, speed: 0.12 + Math.random() * 0.1, phase: Math.random() * 6 });
        }
    }

    // ===== INPUT =====

    function bindInput() {
        const el = renderer.domElement;
        let down = null;
        let last = null;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function pick(e) {
            const rect = el.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const hits = raycaster.intersectObjects(hitMeshes.filter(h => markers[h.userData.loc].available), false);
            if (!hits.length) return null;
            const p = hits[0].point;
            if (p.clone().normalize().dot(camera.position.clone().normalize()) < 0.1) return null;
            return hits[0].object.userData.loc;
        }

        el.addEventListener('pointerdown', e => {
            down = { x: e.clientX, y: e.clientY };
            last = { x: e.clientX, y: e.clientY };
            el.setPointerCapture(e.pointerId);
        });
        el.addEventListener('pointermove', e => {
            if (down) {
                const dx = e.clientX - last.x;
                const dy = e.clientY - last.y;
                cam.tLon -= dx * 0.25;
                cam.tLat = Math.max(-75, Math.min(75, cam.tLat + dy * 0.25));
                last = { x: e.clientX, y: e.clientY };
                if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 5) idleSpin = false;
                return;
            }
            const loc = pick(e);
            if (loc !== hovered) {
                hovered = loc;
                el.style.cursor = loc ? 'pointer' : 'grab';
                if (loc) Sound.play('hover');
            }
            if (onHover) onHover(loc, e.clientX, e.clientY);
        });
        el.addEventListener('pointerup', e => {
            if (down && Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) < 6) {
                const loc = pick(e);
                if (loc && onClick) onClick(loc);
            }
            down = null;
        });
        el.addEventListener('pointerleave', () => { if (onHover) onHover(null); });
        el.addEventListener('wheel', e => {
            e.preventDefault();
            cam.tDist = Math.max(9, Math.min(30, cam.tDist + e.deltaY * 0.01));
        }, { passive: false });
    }

    function resize() {
        if (!renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const scale = renderer.domElement.height / 2;
        landMat.uniforms.scale.value = scale;
        cityMat.uniforms.scale.value = scale;
    }

    // ===== LOOP =====

    function updateSun() {
        const dir = sunDir();
        sunLight.position.copy(dir).multiplyScalar(40);
        sunSprite.position.copy(dir).multiplyScalar(260);
        sunCore.position.copy(dir).multiplyScalar(259);
        landMat.uniforms.sunDir.value.copy(dir);
        cityMat.uniforms.sunDir.value.copy(dir);
    }

    function animate() {
        requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        fpsMeter.frames++;
        if (t - fpsMeter.since >= 1) {
            fpsMeter.fps = fpsMeter.frames / (t - fpsMeter.since);
            fpsMeter.frames = 0;
            fpsMeter.since = t;
        }

        if (idleSpin) cam.tLon += dt * 6;
        const dLon = ((cam.tLon - cam.lon + 540) % 360) - 180;
        cam.lon += dLon * Math.min(1, dt * 3);
        cam.lat += (cam.tLat - cam.lat) * Math.min(1, dt * 3);
        cam.dist += (cam.tDist - cam.dist) * Math.min(1, dt * 3);

        camera.position.copy(latLonToVec(cam.lat, cam.lon, cam.dist));
        if (shakeAmount > 0.001) {
            camera.position.add(new THREE.Vector3().randomDirection().multiplyScalar(shakeAmount));
            shakeAmount *= Math.pow(0.02, dt);
        }
        camera.lookAt(0, 0, 0);

        if (Math.abs(sun.target - sun.angle) > 0.0005) {
            sun.angle += (sun.target - sun.angle) * Math.min(1, dt * 1.2);
            updateSun();
        }
        world.cityLights += (world.cityTarget - world.cityLights) * Math.min(1, dt * 0.8);
        world.winter += (world.winterTarget - world.winter) * Math.min(1, dt * 0.4);
        cityMat.uniforms.time.value = t;
        cityMat.uniforms.intensity.value = world.cityLights;
        landMat.uniforms.nightDim.value = nightBase - world.winter * 0.2;
        clouds.rotation.y += dt * 0.012;
        cloudMat.opacity = 0.42 + world.winter * 0.4;
        if (world.winter > 0.01) cloudMat.color.setRGB(1 - world.winter * 0.62, 1 - world.winter * 0.68, 1 - world.winter * 0.7);
        sunLight.intensity = 2.4 * (1 - world.winter * 0.6);

        moon.position.set(Math.cos(t * 0.02) * 32, 6 + Math.sin(t * 0.02) * 4, Math.sin(t * 0.02) * 32);
        for (const s of satellites) {
            const a = t * s.speed + s.phase;
            const { t1, t2 } = tangentBasis(s.axis);
            s.sat.position.copy(t1.multiplyScalar(Math.cos(a) * s.radius).add(t2.multiplyScalar(Math.sin(a) * s.radius)));
            s.sat.lookAt(0, 0, 0);
            s.blink.material.opacity = (Math.sin(t * 6 + s.phase) > 0.6) ? 1 : 0.1;
        }

        for (const r of routes) {
            const on = (highlight.current === r.a && highlight.near.includes(r.b)) || (highlight.current === r.b && highlight.near.includes(r.a));
            const visible = markers[r.a].available && markers[r.b].available;
            r.line.visible = visible;
            r.line.material.opacity = on ? 0.65 : 0.12;
            r.line.material.color.set(on ? '#fde047' : '#ffffff');
            r.runner.visible = on && visible;
            if (r.runner.visible) {
                const fromA = highlight.current === r.a;
                const k = (t * 0.35 + r.phase) % 1;
                const i = Math.floor((fromA ? k : 1 - k) * (r.pts.length - 1));
                r.runner.position.copy(r.pts[i]);
            }
        }

        for (const [id, m] of Object.entries(markers)) {
            const isCurrent = highlight.current === id;
            const isNear = highlight.near.includes(id);
            const hot = hovered === id;
            m.ring.material.color.set(isCurrent ? '#fde047' : m.baseColor);
            m.ring.scale.setScalar(hot ? 1.35 : 1);
            if (isNear || isCurrent) {
                const k = (t * (isCurrent ? 0.6 : 1)) % 1;
                m.pulse.scale.setScalar(1 + k * 1.6);
                m.pulse.material.opacity = (1 - k) * (isCurrent ? 0.9 : 0.6);
                m.pulse.material.color.set(isCurrent ? '#fde047' : '#ffffff');
            } else {
                m.pulse.material.opacity = 0;
            }
            if (m.beam) m.beam.material.opacity = 0.35 + Math.sin(t * 2 + m.normal.x * 5) * 0.15 + (hot ? 0.3 : 0);
            if (m.shield && m.shield.userData.on) m.shield.material.opacity = 0.18 + Math.sin(t * 3) * 0.08;
            if (m.group.userData.beacon) m.group.userData.beacon.visible = Math.sin(t * 4 + m.normal.y * 3) > 0;
            if (m.progress && m.progress.visible) m.progress.rotation.z += dt * 0.5;
            m.label.material.opacity = m.available ? 1 : 0.35;
        }

        for (const [id, p] of Object.entries(pawns)) {
            if (p.traveling) continue;
            const active = Number(id) === activePawnId;
            const bob = active ? Math.abs(Math.sin(t * 4)) * 0.18 : 0;
            p.mesh.position.copy(p.basePos).add(p.normal.clone().multiplyScalar(bob));
            p.halo.visible = active;
            p.halo.material.opacity = 0.5 + Math.sin(t * 5) * 0.3;
            p.tag.material.opacity = active ? 1 : 0.7;
        }

        for (const c of Object.values(crates)) {
            c.mesh.rotation.y += dt * 2;
            c.mesh.rotation.x += dt * 1.3;
            const h = R + 0.45 + Math.sin(t * 2 + c.phase) * 0.08;
            c.mesh.position.copy(c.normal.clone().multiplyScalar(h));
            c.glow.position.copy(c.mesh.position);
            c.beam.material.opacity = 0.25 + Math.sin(t * 3 + c.phase) * 0.12;
        }

        if (ash) updateAsh(dt);

        for (let i = effects.length - 1; i >= 0; i--) {
            const fx = effects[i];
            fx.age += dt;
            const k = fx.age / fx.life;
            if (k >= 1) {
                fx.onEnd && fx.onEnd();
                fx.objects.forEach(o => { o.parent && o.parent.remove(o); o.geometry && o.geometry.dispose(); });
                effects.splice(i, 1);
            } else {
                fx.update(k, dt);
            }
        }

        renderer.render(scene, camera);
    }

    // ===== PUBLIC: STATE =====

    function focus(locId, dist) {
        const loc = LOCATIONS[locId];
        idleSpin = false;
        cam.tLat = Math.max(-60, Math.min(60, loc.lat * 0.8));
        cam.tLon = loc.lon;
        if (dist) cam.tDist = dist;
    }

    function setIdleSpin(on) {
        idleSpin = on;
    }

    function setTravelSpeed(f) {
        travelSpeed = f;
    }

    function setQuality(q) {
        quality = q === 'low' ? 'low' : 'high';
        const high = quality === 'high';
        renderer.setPixelRatio(high ? Math.min(window.devicePixelRatio, 2) : 1);
        clouds.visible = high;
        cityPoints.visible = high;
        moon.visible = high;
        satellites.forEach(s => { s.sat.visible = high; });
        nightBase = high ? 0.38 : 0.55;
        resize();
    }

    // Aligns round 1's sun with a longitude so the first player starts in daylight.
    function setDayBase(lonDeg) {
        sun.base = -lonDeg * DEG + 0.35;
    }

    function setDay(round, instant = false) {
        sun.target = sun.base + Math.max(0, round - 1) * 0.9;
        if (instant) {
            sun.angle = sun.target;
            updateSun();
        }
    }

    function setHighlights(current, near) {
        highlight = { current, near: near || [] };
    }

    function setAvailability(availableIds) {
        for (const [id, m] of Object.entries(markers)) {
            if (!LOCATIONS[id].isBunker) continue;
            m.available = availableIds.includes(id);
            if (!m.available) drawLabel(m.label, LOCATIONS[id].name, '#6b7280', 'gesperrt');
        }
    }

    function setBunkerState(id, state, ownerColor, text, frac = 0) {
        const m = markers[id];
        if (!m || !m.available) return;
        const color = state === 'done' ? '#22c55e' : state === 'building' ? (ownerColor || '#f59e0b') : LOCATIONS[id].color;
        drawLabel(m.label, LOCATIONS[id].name, color, text);
        m.dome.material.emissive.set(color);
        m.dome.material.emissiveIntensity = state === 'free' ? 0.25 : 0.6;
        m.shield.userData.on = state === 'done';
        if (state !== 'done') m.shield.material.opacity = 0;
        if (state === 'done' && ownerColor) m.shield.material.color.set(ownerColor);
        m.progress.visible = state === 'building' && frac > 0;
        if (m.progress.visible) {
            m.progress.geometry.dispose();
            m.progress.geometry = new THREE.RingGeometry(0.46, 0.54, 48, 1, 0, Math.PI * 2 * Math.min(1, frac));
            m.progress.material.color.set(ownerColor || '#ffffff');
        }
    }

    function pawnSlot(locId, index, count) {
        const normal = markers[locId].normal.clone();
        const { t1, t2 } = tangentBasis(normal);
        const radius = count > 1 ? 0.5 : 0.45;
        const a = (index / Math.max(1, count)) * Math.PI * 2 + 0.6;
        const pos = normal.clone().multiplyScalar(R)
            .add(t1.multiplyScalar(Math.cos(a) * radius))
            .add(t2.multiplyScalar(Math.sin(a) * radius));
        return { pos, normal: pos.clone().normalize() };
    }

    function createPawn(player) {
        const color = new THREE.Color(player.color);
        const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, metalness: 0.3, roughness: 0.4 });
        const mesh = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.07, 20), mat);
        base.position.y = 0.035;
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 20), mat);
        body.position.y = 0.23;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), mat);
        head.position.y = 0.43;
        mesh.add(base, body, head);
        if (player.isBot) {
            const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            antenna.position.y = 0.58;
            const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff3333 }));
            tip.position.y = 0.66;
            mesh.add(antenna, tip);
        }
        mesh.scale.setScalar(1.25);

        const halo = new THREE.Mesh(
            new THREE.RingGeometry(0.2, 0.26, 32),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide, depthWrite: false })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = 0.01;
        mesh.add(halo);

        const icon = CHARACTERS[player.char] ? CHARACTERS[player.char].icon + ' ' : '';
        const tag = makeTag(`${icon}${player.name}`, player.color, 0.62);
        tag.position.y = player.isBot ? 0.9 : 0.8;
        mesh.add(tag);

        globeGroup.add(mesh);
        pawns[player.id] = { mesh, halo, tag, basePos: new THREE.Vector3(), normal: new THREE.Vector3(0, 1, 0), traveling: false, loc: null };
    }

    function layoutPawns(players) {
        const groups = {};
        players.forEach(p => { (groups[p.location] = groups[p.location] || []).push(p); });
        for (const [loc, list] of Object.entries(groups)) {
            list.forEach((p, i) => {
                const pawn = pawns[p.id];
                if (!pawn || pawn.traveling) return;
                const slot = pawnSlot(loc, i, list.length);
                pawn.basePos.copy(slot.pos);
                pawn.normal.copy(slot.normal);
                pawn.loc = loc;
                pawn.tag.position.y = 0.8 + i * 0.22;
                orientToNormal(pawn.mesh, slot.normal);
                pawn.mesh.position.copy(slot.pos);
            });
        }
    }

    function setPlayers(players) {
        players.forEach(createPawn);
        layoutPawns(players);
    }

    function setActivePawn(id) {
        activePawnId = id;
    }

    // ===== PUBLIC: ANIMATIONS =====

    function tween(life, update, onEnd, objects = []) {
        return new Promise(resolve => {
            effects.push({
                age: 0, life, update, objects,
                onEnd: () => { onEnd && onEnd(); resolve(); },
            });
        });
    }

    function arcPath(a, b, lift) {
        const pts = [];
        const angle = a.clone().normalize().angleTo(b.clone().normalize());
        const height = lift * (0.6 + angle);
        const ra = a.length();
        const rb = b.length();
        for (let i = 0; i <= 80; i++) {
            const t = i / 80;
            const dir = slerpVec(a, b, t);
            const r = ra + (rb - ra) * t + Math.sin(Math.PI * t) * height;
            pts.push(dir.multiplyScalar(r));
        }
        return pts;
    }

    function trailLine(pts, color, opacity = 0.9) {
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        geo.setDrawRange(0, 0);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
        globeGroup.add(line);
        return line;
    }

    function makePlane(color) {
        const plane = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: new THREE.Color(color), emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.3 });
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.42, 10), mat);
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 10), mat);
        nose.position.y = 0.26;
        const wings = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.015), mat);
        wings.position.y = 0.02;
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.012), mat);
        tail.position.y = -0.17;
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.07, 0.08), mat);
        fin.position.set(0, -0.17, 0.04);
        plane.add(fuselage, nose, wings, tail, fin);
        plane.scale.setScalar(1.4);
        return plane;
    }

    function travel(player, from, to, allPlayers) {
        const pawn = pawns[player.id];
        const start = pawn.basePos.clone();
        const destList = allPlayers.filter(p => p.location === to);
        const idx = destList.findIndex(p => p.id === player.id);
        const end = pawnSlot(to, idx < 0 ? destList.length : idx, Math.max(destList.length, 1)).pos;
        const pts = arcPath(start, end, 1.0);
        const trail = trailLine(pts, player.color);
        const plane = makePlane(player.color);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: player.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        glow.scale.set(0.9, 0.9, 1);
        const tag = makeTag(player.name, player.color, 0.62);
        globeGroup.add(plane, glow, tag);
        pawn.traveling = true;
        pawn.mesh.visible = false;
        Sound.play('takeoff');

        let lastPuff = 0;
        return tween(1.8 * travelSpeed, k => {
            const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            const i = Math.min(79, Math.floor(e * 80));
            const f = e * 80 - i;
            const p = pts[i].clone().lerp(pts[i + 1], f);
            const dir = pts[Math.min(80, i + 1)].clone().sub(pts[i]).normalize();
            plane.position.copy(p);
            glow.position.copy(p);
            tag.position.copy(p.clone().add(p.clone().normalize().multiplyScalar(0.45)));
            const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
            const bank = new THREE.Quaternion().setFromAxisAngle(dir, Math.sin(k * Math.PI * 2) * 0.35);
            plane.quaternion.copy(bank.multiply(q));
            trail.geometry.setDrawRange(0, i + 1);
            trail.material.opacity = k > 0.8 ? (1 - k) * 4.5 : 0.9;
            if (k - lastPuff > 0.04 && k < 0.95) {
                lastPuff = k;
                const puff = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }));
                puff.position.copy(p);
                puff.scale.set(0.15, 0.15, 1);
                globeGroup.add(puff);
                tween(1.2, s => { puff.scale.setScalar(0.15 + s * 0.4); puff.material.opacity = 0.35 * (1 - s); }, null, [puff]);
            }
            const ll = vecToLatLon(p);
            cam.tLat = Math.max(-60, Math.min(60, ll.lat * 0.8));
            cam.tLon = ll.lon;
        }, () => {
            pawn.traveling = false;
            pawn.mesh.visible = true;
            layoutPawns(allPlayers);
            ring(to, player.color, 1.2);
            Sound.play('coin');
        }, [trail, plane, glow, tag]).then(() => focus(to));
    }

    function ring(locId, color, size = 1.5) {
        const m = markers[locId];
        const r = new THREE.Mesh(
            new THREE.RingGeometry(0.3, 0.4, 48),
            new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        r.rotation.x = -Math.PI / 2;
        r.position.y = 0.05;
        m.group.add(r);
        return tween(0.9, k => {
            r.scale.setScalar(1 + k * size * 3);
            r.material.opacity = 1 - k;
        }, null, [r]);
    }

    function popText(locId, text, color) {
        const m = markers[locId];
        if (!m) return Promise.resolve();
        const slot = m.pops++;
        const tag = makeTag(text, color || '#fbbf24', 0.9);
        const base = m.normal.clone().multiplyScalar(R + 1.1 + (slot % 3) * 0.4);
        tag.position.copy(base);
        globeGroup.add(tag);
        return tween(2.0, k => {
            tag.position.copy(base.clone().add(m.normal.clone().multiplyScalar(k * 0.9)));
            tag.material.opacity = k < 0.15 ? k / 0.15 : k > 0.7 ? (1 - k) / 0.3 : 1;
            const s = 0.9 * (k < 0.15 ? 0.6 + k * 2.7 : 1);
            tag.scale.set(1.9 * s, 0.36 * s, 1);
        }, () => { m.pops = Math.max(0, m.pops - 1); }, [tag]);
    }

    function sparks(locId, color) {
        const m = markers[locId];
        const n = 40;
        const origin = m.normal.clone().multiplyScalar(R + 0.2);
        const { t1, t2 } = tangentBasis(m.normal);
        const vel = [];
        const pos = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 0.6 + Math.random() * 1.2;
            vel.push(t1.clone().multiplyScalar(Math.cos(a) * s).add(t2.clone().multiplyScalar(Math.sin(a) * s)).add(m.normal.clone().multiplyScalar(1 + Math.random() * 1.5)));
            pos.set([origin.x, origin.y, origin.z], i * 3);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const pts = new THREE.Points(geo, new THREE.PointsMaterial({
            color, size: 0.12, map: softTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        }));
        globeGroup.add(pts);
        return tween(1.3, (k, dt) => {
            const attr = geo.attributes.position;
            for (let i = 0; i < n; i++) {
                vel[i].add(m.normal.clone().multiplyScalar(-3 * dt));
                attr.setXYZ(i, attr.getX(i) + vel[i].x * dt, attr.getY(i) + vel[i].y * dt, attr.getZ(i) + vel[i].z * dt);
            }
            attr.needsUpdate = true;
            pts.material.opacity = 1 - k;
        }, null, [pts]);
    }

    function explosionAt(normal, big = false) {
        const n = normal.clone().normalize();
        const pos = n.clone().multiplyScalar(R);
        const scale = big ? 1.8 : 0.8;
        const objects = [];

        const flash = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16),
            new THREE.MeshBasicMaterial({ color: 0xfff7cc, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        flash.position.copy(pos);
        const fire = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 16),
            new THREE.MeshBasicMaterial({ color: 0xff6a00, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        fire.position.copy(pos);
        const shock = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 64),
            new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
        shock.position.copy(n.clone().multiplyScalar(R + 0.02));
        shock.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
        objects.push(flash, fire, shock);

        let stem = null;
        let cap = null;
        if (big) {
            stem = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 1, 16, 1, true),
                new THREE.MeshBasicMaterial({ color: 0xff8c42, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
            cap = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 16),
                new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
            orientToNormal(stem, n);
            objects.push(stem, cap);
        }
        objects.forEach(o => globeGroup.add(o));
        shake(big ? 0.35 : 0.12);
        Sound.play('explosion', big);

        return tween(big ? 3.2 : 1.4, k => {
            flash.scale.setScalar(scale * (0.3 + k * 3));
            flash.material.opacity = Math.max(0, 1 - k * 4);
            fire.scale.setScalar(scale * (0.5 + Math.sqrt(k) * 1.6));
            fire.material.opacity = Math.max(0, 0.9 - k);
            fire.material.color.setHSL(0.08 - k * 0.07, 1, 0.55 - k * 0.3);
            shock.scale.setScalar(scale * (1 + k * 6));
            shock.material.opacity = Math.max(0, 0.9 - k * 1.2);
            if (big) {
                const h = Math.min(1, k * 2.5) * 1.6;
                stem.scale.set(1, h, 1);
                stem.position.copy(n.clone().multiplyScalar(R + h / 2));
                stem.material.opacity = Math.max(0, 0.8 - k * 0.8);
                cap.position.copy(n.clone().multiplyScalar(R + h + 0.2));
                cap.scale.set(1 + k * 1.5, 0.6 + k * 0.6, 1 + k * 1.5);
                cap.material.opacity = Math.max(0, 0.9 - k * 0.9);
                cap.material.color.setHSL(0.07 - k * 0.06, 1, 0.6 - k * 0.35);
            }
        }, null, objects);
    }

    function explosion(locId, big = false) {
        return explosionAt(markers[locId].normal, big);
    }

    function scorch(normal, radiusDeg) {
        const col = landPoints.geometry.attributes.aColor;
        const cosR = Math.cos(radiusDeg * DEG);
        const n = normal.clone().normalize();
        for (let i = 0; i < landLatLon.length; i++) {
            const d = landLatLon[i].dot(n);
            if (d > cosR) {
                const heat = (d - cosR) / (1 - cosR);
                col.setXYZ(i, 0.35 + heat * 0.6 + Math.random() * 0.1, 0.05 + heat * 0.25, 0.02);
            }
        }
        col.needsUpdate = true;
    }

    function resetScorch() {
        const col = landPoints.geometry.attributes.aColor;
        col.array.set(landBaseColors);
        col.needsUpdate = true;
    }

    function missile(fromNormal, toNormal, color = '#ff4444', big = true) {
        const a = fromNormal.clone().normalize().multiplyScalar(R);
        const b = toNormal.clone().normalize().multiplyScalar(R);
        const pts = arcPath(a, b, 1.8);
        const trail = trailLine(pts, color, 0.8);
        const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: 0xffeeaa, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        head.scale.set(0.5, 0.5, 1);
        globeGroup.add(head);
        const life = 1.6 + Math.random() * 0.8;
        return tween(life, k => {
            const e = k * k * (3 - 2 * k);
            const i = Math.min(79, Math.floor(e * 80));
            head.position.copy(pts[i].clone().lerp(pts[i + 1], e * 80 - i));
            trail.geometry.setDrawRange(0, i + 1);
        }, () => {
            tween(1.5, k => { trail.material.opacity = 0.8 * (1 - k); }, null, [trail]);
            explosionAt(b, big);
            scorch(b, big ? 9 : 5);
        }, [head]);
    }

    function missileBetween(fromLoc, toLoc, color) {
        return missile(markers[fromLoc].normal, markers[toLoc].normal, color, false);
    }

    async function apocalypse(protectedIds) {
        idleSpin = true;
        cam.tDist = 21;
        cam.tLat = 20;
        const sources = LAND_SHAPES.filter(s => ['asien', 'nordamerika', 'europa'].includes(s.id));
        const launches = [];
        const targets = [];
        for (let i = 0; i < 36; i++) {
            const lat = -55 + Math.random() * 125;
            const lon = -180 + Math.random() * 360;
            if (landAt(lat, lon)) targets.push(latLonToVec(lat, lon, 1));
            if (targets.length >= 22) break;
        }
        for (const id of CONTINENT_IDS) targets.push(markers[id].normal.clone());
        for (const [id, m] of Object.entries(markers)) {
            if (LOCATIONS[id].isBunker && !protectedIds.includes(id)) targets.push(m.normal.clone());
        }
        targets.forEach((tgt, i) => {
            const [lon, lat] = rand(rand(sources).pts);
            const from = latLonToVec(lat, lon, 1);
            launches.push(new Promise(res => setTimeout(() => missile(from, tgt, i % 2 ? '#ff5533' : '#ffaa33', true).then(res), i * 220)));
        });
        for (const id of protectedIds) {
            const m = markers[id];
            if (m.shield) {
                m.shield.userData.on = true;
                m.shield.material.color.set('#22c55e');
            }
        }
        world.cityTarget = 0;
        await Promise.all(launches);
        atmosphereMat.uniforms.glowColor.value.set('#ff3b1f');
        atmosphereMat.uniforms.strength.value = 2.2;
    }

    function nuclearWinter() {
        world.winterTarget = 1;
        world.cityTarget = 0;
        const n = 1800;
        const pos = new Float32Array(n * 3);
        const dirs = [];
        for (let i = 0; i < n; i++) {
            const d = new THREE.Vector3().randomDirection();
            const r = R + 0.2 + Math.random() * 4;
            dirs.push({ d, r, speed: 0.2 + Math.random() * 0.4 });
            pos.set([d.x * r, d.y * r, d.z * r], i * 3);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const points = new THREE.Points(geo, new THREE.PointsMaterial({
            color: 0x9ca3af, size: 0.06, map: softTex(), transparent: true, opacity: 0.8, depthWrite: false,
        }));
        globeGroup.add(points);
        ash = { points, dirs };
    }

    function updateAsh(dt) {
        const attr = ash.points.geometry.attributes.position;
        ash.dirs.forEach((a, i) => {
            a.r -= a.speed * dt;
            if (a.r < R + 0.05) {
                a.r = R + 3 + Math.random() * 1.5;
                a.d.randomDirection();
            }
            attr.setXYZ(i, a.d.x * a.r, a.d.y * a.r, a.d.z * a.r);
        });
        attr.needsUpdate = true;
    }

    function shake(amount) {
        shakeAmount = Math.max(shakeAmount, amount);
    }

    function setThreat(level) {
        const c = new THREE.Color('#3b82f6').lerp(new THREE.Color('#ef4444'), Math.max(0, Math.min(1, level)));
        atmosphereMat.uniforms.glowColor.value.copy(c);
        atmosphereMat.uniforms.strength.value = 1 + level * 0.8;
        cloudMat.color.setRGB(1, 1 - level * 0.25, 1 - level * 0.35);
    }

    // ===== CRATES =====

    function addCrate(crate) {
        const loc = LOCATIONS[crate.loc];
        const normal = latLonToVec(loc.lat + crate.dLat, loc.lon + crate.dLon, 1);
        const mesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.2),
            new THREE.MeshStandardMaterial({ color: 0xe879f9, emissive: 0xc026d3, emissiveIntensity: 0.9, metalness: 0.5, roughness: 0.2 })
        );
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: 0xe879f9, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        glow.scale.set(1.1, 1.1, 1);
        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.06, 2.2, 8, 1, true),
            new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        beam.position.copy(normal.clone().multiplyScalar(R + 1.1));
        orientToNormal(beam, normal);
        globeGroup.add(mesh, glow, beam);
        crates[crate.id] = { mesh, glow, beam, normal, phase: Math.random() * 6 };
    }

    function removeCrate(id, collectorColor) {
        const c = crates[id];
        if (!c) return Promise.resolve();
        delete crates[id];
        const start = c.mesh.position.clone();
        return tween(0.8, k => {
            c.mesh.position.copy(start.clone().add(c.normal.clone().multiplyScalar(k * 1.5)));
            c.mesh.scale.setScalar(1 + k * 1.5);
            c.mesh.material.opacity = 1 - k;
            c.mesh.material.transparent = true;
            c.glow.position.copy(c.mesh.position);
            c.glow.scale.setScalar(1.1 + k * 3);
            c.glow.material.opacity = 1 - k;
            c.beam.material.opacity = 0.3 * (1 - k);
            if (collectorColor) c.glow.material.color.set(collectorColor);
        }, null, [c.mesh, c.glow, c.beam]);
    }

    return {
        init, focus, setIdleSpin, setTravelSpeed, setQuality, getFps: () => fpsMeter.fps, getQuality: () => quality, setDay, setDayBase, setHighlights, setAvailability, setBunkerState,
        setPlayers, layoutPawns, setActivePawn, travel, ring, popText, sparks, explosion, missileBetween,
        apocalypse, nuclearWinter, shake, setThreat, addCrate, removeCrate, resetScorch, scorch,
        normalOf: id => markers[id].normal.clone(),
    };
})();
