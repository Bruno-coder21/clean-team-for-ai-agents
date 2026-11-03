#!/usr/bin/env python3
"""Gera templates/fluxo-ideias.template.yaml a partir da base e dos AGENT.md.

Assim as instruções dos agentes têm uma fonte só. Com --check, não escreve nada
e sai com 1 se o template gerado estiver desatualizado.
"""

import argparse
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "templates" / "fluxo-ideias.base.yaml"
SAIDA = RAIZ / "templates" / "fluxo-ideias.template.yaml"
AVISO = (
    "# GERADO por scripts/montar_template.py. Não edite aqui: edite\n"
    "# templates/fluxo-ideias.base.yaml ou agentes/*/AGENT.md e rode o script.\n"
)
MARCADOR = re.compile(r"^( *)instructions: __AGENTE:([a-z-]+)__$", re.MULTILINE)


def instrucoes(agente: str) -> str:
    """O corpo do AGENT.md, sem o frontmatter."""
    texto = (RAIZ / "agentes" / agente / "AGENT.md").read_text(encoding="utf-8")
    return re.sub(r"\A---\n.*?\n---\n", "", texto, flags=re.DOTALL).strip()


def bloco(achado: re.Match[str]) -> str:
    recuo, agente = achado.groups()
    linhas = instrucoes(agente).splitlines()
    corpo = "\n".join(f"{recuo}  {linha}" if linha else "" for linha in linhas)
    return f"{recuo}instructions: |\n{corpo}"


def montar() -> str:
    return AVISO + MARCADOR.sub(bloco, BASE.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    gerado = montar()
    if parser.parse_args().check:
        if not SAIDA.exists() or SAIDA.read_text(encoding="utf-8") != gerado:
            print(f"{SAIDA.name} está desatualizado: rode scripts/montar_template.py")
            return 1
        print(f"{SAIDA.name} em dia")
        return 0
    SAIDA.write_text(gerado, encoding="utf-8")
    print(f"gerado {SAIDA.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
