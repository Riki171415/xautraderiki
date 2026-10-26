import unittest,sys,types,importlib.util
from pathlib import Path
mt5=types.ModuleType('MetaTrader5')
for name in ['M1','M5','M15','M30','H1','H4','D1','W1','MN1']:setattr(mt5,'TIMEFRAME_'+name,name)
sys.modules['MetaTrader5']=mt5
spec=importlib.util.spec_from_file_location('bridge',Path(__file__).resolve().parents[1]/'exness_mt5_bridge.py')
bridge=importlib.util.module_from_spec(spec);spec.loader.exec_module(bridge)
class SourceTests(unittest.TestCase):
 def test_server_and_account_both_define_source(self):
  a=types.SimpleNamespace(server='Exness-ServerA',login=1)
  b=types.SimpleNamespace(server='Exness-ServerB',login=1)
  c=types.SimpleNamespace(server='Exness-ServerA',login=2)
  self.assertNotEqual(bridge.session_identity(a),bridge.session_identity(b))
  self.assertNotEqual(bridge.session_identity(a),bridge.session_identity(c))
  self.assertEqual(bridge.session_identity(None),(None,None))
 def test_symbol_suffix_is_resolved_again_for_each_account(self):
  supported={'XAUUSDc','EURUSDc'}
  mt5.symbol_info=lambda name:object() if name in supported else None
  mt5.symbol_select=lambda name,enable:name in supported
  self.assertEqual(bridge.resolve_symbols(),['XAUUSDc','EURUSDc'])
  supported.clear();supported.update(['XAUUSDm','BTCUSDm'])
  self.assertEqual(bridge.resolve_symbols(),['XAUUSDm','BTCUSDm'])


class PositionsTests(unittest.TestCase):
 def setUp(self):
  self.account=types.SimpleNamespace(server='Exness-Test',login=1,currency='USC')
  mt5.account_info=lambda:self.account
 def test_empty_is_available_but_api_failure_is_not(self):
  mt5.positions_get=lambda:()
  self.assertTrue(bridge.read_open_positions(('Exness-Test',1))['available'])
  mt5.positions_get=lambda:None
  self.assertFalse(bridge.read_open_positions(('Exness-Test',1))['available'])
 def test_source_change_during_positions_read_discards_snapshot(self):
  def changed():
   self.account=types.SimpleNamespace(server='Exness-Other',login=2,currency='USD')
   return ()
  mt5.positions_get=changed
  self.assertIsNone(bridge.read_open_positions(('Exness-Test',1)))

if __name__=='__main__':unittest.main()
