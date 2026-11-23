#!/usr/bin/env python3
"""Generate wiki/ANNEXE_MESSAGES.fr.md from translations/fr.json and messages.py (annex B of the wiki plan).

The texts come from the translation file, so they are the ones Home Assistant shows; only the "Que faire" column is
written here. Run it from the repository root: ``python3 scripts/wiki_messages.py`` (``--check`` fails when the page
is out of date).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FR = json.loads((ROOT / "custom_components/weekly_planner/translations/fr.json").read_text(encoding="utf-8"))
PAGE = ROOT / "wiki/ANNEXE_MESSAGES.fr.md"

SETTINGS_ERRORS = {
    "invalid_mode_selector_domain": "Choisir une liste déroulante (`input_select`) ou une liste de choix (`select`).",
    "circular_mode_selector": "Choisir une entité qui n’est pas un interrupteur de Weekly Planner.",
    "invalid_default_mode": "Saisir le nom d’un mode, de 1 à 40 caractères.",
    "unknown_default_mode": "Choisir un des choix du sélecteur, écrit exactement pareil.",
    "invalid_holiday_entity_domain": "Choisir un capteur, un interrupteur ou un calendrier.",
    "circular_holiday_entity": "Choisir une entité qui n’est pas un interrupteur de Weekly Planner.",
    "driven_holiday_entity": "Choisir une entité qu’aucun programme ne commande.",
    "invalid_holiday_invert": "Cocher la case ou la laisser vide.",
}
REPAIRS = {
    "missing_entities": "Ouvrir le panneau **Weekly Planner**, modifier le programme et retirer l’appareil absent (ou le remettre dans Home Assistant).",
    "yaml_invalid": "Corriger le fichier `weekly_planner.yml` : il est relu dans les 30 secondes ([Le fichier de configuration YAML](CONFIGURATION.fr.md#le-fichier-de-configuration-yaml)).",
    "mode_option_missing": "Dans l’écran des horaires, rattacher le mode à une option du sélecteur, ou supprimer ses horaires ([Modes, lecture seule et limites](REGLAGES.fr.md#modes-lecture-seule-et-limites)).",
    "holiday_entity_missing": "Choisir une autre entité dans **Configurer → Réglages**, ou remettre celle-ci dans Home Assistant ([Les jours fériés](GUIDE_JOUR_FERIE.fr.md)).",
}
NOTIFICATIONS = {
    "unavailable": "L’appareil recevra son réglage dès qu’il reviendra. S’il reste indisponible, vérifier l’appareil lui-même.",
    "failed": "Home Assistant a refusé la commande après plusieurs essais. Vérifier l’appareil, puis **Appliquer maintenant** ([Après une panne](GUIDE_APRES_PANNE.fr.md)).",
    "storage": "Restaurer la sauvegarde de `.storage/weekly_planner` ([Sauvegarde et restauration](CONFIGURATION.fr.md#sauvegarde-et-restauration)).",
}
SOURCES = "Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité))."
SERVICES = {
    "not_loaded": "Attendre la fin du chargement de Weekly Planner, ou le recharger.",
    "pause_range": "Donner une durée de 1 heure à 365 jours ([Entités et services](ENTITES_SERVICES.fr.md#services-pour-vos-automatisations)).",
    "unknown_program": "Relire l’identifiant du programme ([Où trouver l’identifiant](CONFIGURATION.fr.md#où-trouver-lidentifiant-dun-programme)).",
}


def cell(text: str) -> str:
    return " ".join(str(text).split()).replace("|", "\\|")


def table(head: tuple[str, ...], rows: list[tuple[str, ...]]) -> list[str]:
    out = ["| " + " | ".join(head) + " |", "|" + "---|" * len(head)]
    out += ["| " + " | ".join(cell(c) for c in row) + " |" for row in rows]
    return out


def notifications() -> dict[str, str]:
    sys.path.insert(0, str(ROOT))
    from custom_components.weekly_planner.messages import _MESSAGES

    return _MESSAGES["fr"]


def build() -> str:
    errors = FR["options"]["error"]
    texts = notifications()
    lines = [
        "Français",
        "",
        "# Annexe : messages et réparations",
        "",
        "Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->",
        "",
        (
            "Les messages que Weekly Planner montre dans Home Assistant, tels qu’ils s’écrivent, avec ce qu’il faut faire. "
            "Les messages de la carte et du panneau sont expliqués dans les pages où ils apparaissent "
            "([Les réglages et leurs actions](REGLAGES.fr.md), [Entités, services et automatisations](ENTITES_SERVICES.fr.md)). "
            "Cette page est générée à partir des fichiers de traduction de l’intégration."
        ),
        "",
        (
            "Sur cette page : [Réglages de l’intégration](#réglages-de-lintégration) · [Réparations](#réparations) · "
            "[Notifications](#notifications) · [Messages des actions et des valeurs lues](#messages-des-actions-et-des-valeurs-lues)."
        ),
        "",
        "## Réglages de l’intégration",
        "",
        "Affichés dans **Paramètres → Appareils et services → Weekly Planner → Configurer → Réglages**.",
        "",
        *table(("Message", "Que faire"), [(errors[key], todo) for key, todo in SETTINGS_ERRORS.items()]),
        "",
        "## Réparations",
        "",
        "Affichées dans **Paramètres → Système → Réparations**. `{…}` est remplacé par les noms concernés.",
        "",
        *table(("Titre et message", "Que faire"),
               [(f"**{FR['issues'][key]['title']}** : {FR['issues'][key]['description']}", todo) for key, todo in REPAIRS.items()]),
        "",
        "## Notifications",
        "",
        "Affichées dans la cloche de Home Assistant.",
        "",
        *table(("Message", "Que faire"), [(texts[key], todo) for key, todo in NOTIFICATIONS.items()]),
        "",
        "Avant un renvoi de l’état aux appareils ([Après une panne](GUIDE_APRES_PANNE.fr.md)), la liste dit pourquoi un appareil est laissé tel quel :",
        "",
        *[f"- « {texts[key]} »" for key in texts if key.startswith("resync_reason_")],
        "",
        "## Messages des actions et des valeurs lues",
        "",
        (
            "Affichés quand une action de Weekly Planner est lancée avec de mauvaises données, ou quand une valeur lue sur une entité "
            "ne peut pas servir ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité))."
        ),
        "",
        *table(("Message", "Que faire"),
               [(FR["exceptions"][key]["message"], todo) for key, todo in SERVICES.items()]
               + [(FR["exceptions"][key]["message"], SOURCES) for key in FR["exceptions"] if key.startswith("source_")]),
        "",
        "[← Accueil](ACCUEIL.fr.md) · [Entités, services et automatisations](ENTITES_SERVICES.fr.md)",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    text = build()
    if "--check" in sys.argv:
        if not PAGE.exists() or PAGE.read_text(encoding="utf-8") != text:
            print(f"{PAGE.relative_to(ROOT)} is out of date: run scripts/wiki_messages.py")
            return 1
        return 0
    PAGE.write_text(text, encoding="utf-8")
    print(f"wrote {PAGE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
