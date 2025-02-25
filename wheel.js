class WeaponWheel {
  constructor() {
    this.weapons = [
      "Lance", // En haut (position 12h)
      "Lance-Canon", // 1h
      "Morpho-Hache", // 2h
      "Volto-Hache", // 3h
      "Insectoglaive", // 4h
      "Arc", // 5h
      "Fusarbalète Légère", // 6h
      "Fusarbalète Lourde", // 7h
      "Lancecanon", // 8h
      "Grande Épée", // 9h
      "Épée & Bouclier", // 10h
      "Double Lames", // 11h
      "Marteau", // 11h30
      "Corne de Chasse", // 11h45
    ];

    this.colors = [
      "#8B4513", // Marron Rathalos
      "#2F4F4F", // Gris-vert Nargacuga
      "#556B2F", // Vert olive Rathian
      "#CD853F", // Marron clair Tigrex
      "#8B0000", // Rouge foncé Gore Magala
      "#4A6741", // Vert forêt ancien
      "#B8860B", // Or Rajang
      "#483D8B", // Bleu-violet Zinogre
      "#6B4423", // Marron Barroth
      "#800000", // Rouge Teostra
      "#4F7942", // Vert chasseur
      "#DAA520", // Or Kulve Taroth
      "#654321", // Marron Diablos
      "#228B22", // Vert forêt
    ];

    this.canvas = document.getElementById("wheel");
    this.ctx = this.canvas.getContext("2d");
    this.currentRotation = 0;
    this.isSpinning = false;
  }

  spin() {
    if (this.isSpinning) return;

    console.log("Début de la rotation");
    this.isSpinning = true;
    const spinAngle = 3600 + Math.random() * 360; // 10 tours + angle aléatoire
    const duration = 5000; // 5 secondes
    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Fonction d'easing pour un ralentissement progressif
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);

      this.currentRotation = spinAngle * easeOut(progress);
      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.announceResult();
      }
    };

    requestAnimationFrame(animate);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate((this.currentRotation * Math.PI) / 180);

    const sliceAngle = (2 * Math.PI) / this.weapons.length;

    this.weapons.forEach((weapon, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Utiliser les nouvelles couleurs
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = this.colors[i];
      this.ctx.fill();

      // Texte en blanc pour meilleure lisibilité
      this.ctx.save();
      this.ctx.rotate(startAngle + sliceAngle / 2);
      this.ctx.textAlign = "right";
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.font = "bold 14px Arial";
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(weapon, radius - 10, 5);
      this.ctx.fillText(weapon, radius - 10, 5);
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  getSelectedWeapon() {
    const totalWeapons = this.weapons.length;
    const anglePerWeapon = 360 / totalWeapons;
    // Ajuster l'angle pour compenser le décalage
    const adjustedAngle = (360 - (this.currentRotation % 360) - 90 + 360) % 360;
    const index = Math.floor(adjustedAngle / anglePerWeapon);

    console.log("Angle ajusté:", adjustedAngle);
    console.log("Index calculé:", index);
    console.log("Arme à cet index:", this.weapons[index]);

    return this.weapons[index];
  }

  announceResult() {
    const selectedWeapon = this.getSelectedWeapon();
    console.log("Arme sélectionnée:", selectedWeapon);
    document.getElementById(
      "result"
    ).textContent = `Arme sélectionnée : ${selectedWeapon}`;

    if (this.onSpinComplete) {
      this.onSpinComplete(selectedWeapon);
    }
  }
}
