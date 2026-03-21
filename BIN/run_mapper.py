#!/usr/bin/env python3
"""Wrapper to run javascript_mapper.py with piped input by disabling cls."""
import os
# Prevent cls from consuming stdin
os.system = lambda *a, **k: None

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from javascript_mapper import main
main()
